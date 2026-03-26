import { NextRequest, NextResponse } from "next/server"
import { MultimediaServiceRole } from "@prisma/client"
import { db } from "@/lib/db"
import { requireMultimediaAdmin } from "@/lib/auth"
import Anthropic from "@anthropic-ai/sdk"

function formatDate(date: Date): string {
  return date.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export async function POST(request: NextRequest) {
  const { response } = await requireMultimediaAdmin()
  if (response) return response

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ success: false, message: "ANTHROPIC_API_KEY belum dikonfigurasi" }, { status: 500 })
  }

  let periodId: string | undefined

  try {
    const body = await request.json()
    const { periodId: pid } = body
    if (!pid || typeof pid !== 'string') {
      return NextResponse.json({ success: false, message: "periodId wajib diisi" }, { status: 400 })
    }
    periodId = pid

    await db.schedulePeriod.update({
      where: { id: periodId },
      data: { status: 'CLOSED' },
    })

    const [events, members, availabilityData] = await Promise.all([
      db.scheduleEvent.findMany({
        where: { periodId },
        orderBy: [{ tanggal: 'asc' }, { order: 'asc' }],
      }),
      db.multimediaMember.findMany({
        where: { isActive: true },
      }),
      db.memberAvailability.findMany({
        where: { event: { periodId } },
        include: { member: true, event: true },
      }),
    ])

    const availabilitySummary = events.map(e => {
      const avail = availabilityData.filter(a => a.eventId === e.id)
      const available = avail.filter(a => a.status === 'AVAILABLE').map(a => a.member.nama)
      const unavailable = avail.filter(a => a.status === 'UNAVAILABLE').map(a => a.member.nama)
      return `${e.namaEvent} (${e.tanggal.toISOString().split('T')[0]}):\n  AVAILABLE: ${available.join(', ') || 'none'}\n  UNAVAILABLE: ${unavailable.join(', ') || 'none'}`
    }).join('\n\n')

    const prompt = `You are a scheduling assistant for a church multimedia team.

TEAM MEMBERS (with their capabilities):
${members.map(m => `- ${m.nama} [ID: ${m.id}] — can do: ${m.serviceRoles.join(', ')}`).join('\n')}

EVENTS TO STAFF:
${events.map(e => `- ${e.namaEvent} [ID: ${e.id}] on ${formatDate(e.tanggal)} at ${e.waktu} — needs: ${e.requiredRoles.join(', ')}${e.isLive ? ' 🔴 LIVE' : ''}${e.keterangan ? ` (${e.keterangan})` : ''}`).join('\n')}

MEMBER AVAILABILITY:
${availabilitySummary}

SCHEDULING RULES:
- ONLY assign members who are AVAILABLE for that event
- ONLY assign members to roles matching their serviceRoles
- Distribute workload FAIRLY across members
- For LIVE events: prioritize experienced members for STR and CAM
- Each event needs exactly the roles listed in requiredRoles
- If not enough available members, leave role UNASSIGNED

Return ONLY valid JSON array, no markdown:
[{"eventId":"...","memberId":"...","role":"SLD|SND|STR|CAM"}]
For unassignable slots: [{"eventId":"...","memberId":null,"role":"SLD","reason":"..."}]`

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const aiResponse = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })
    const text = aiResponse.content[0].type === 'text' ? aiResponse.content[0].text : ''

    const jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const rawAssignments = JSON.parse(jsonText) as Array<{
      eventId: string
      memberId: string | null
      role: string
      reason?: string
    }>

    const validEventIds = new Set(events.map(e => e.id))
    const validMemberIds = new Set(members.map(m => m.id))
    const validRoles = new Set(['SLD', 'SND', 'STR', 'CAM'])

    const warnings: Array<{ eventId: string; role: string; reason: string }> = []
    const validAssignments = rawAssignments.filter(a => {
      if (!validEventIds.has(a.eventId)) return false
      if (a.memberId === null) {
        warnings.push({ eventId: a.eventId, role: a.role, reason: a.reason ?? 'No available member' })
        return false
      }
      return validMemberIds.has(a.memberId) && validRoles.has(a.role)
    }) as Array<{ eventId: string; memberId: string; role: string }>

    await Promise.all(
      validAssignments.map(a =>
        db.scheduleAssignment.upsert({
          where: { eventId_memberId: { eventId: a.eventId, memberId: a.memberId } },
          create: { eventId: a.eventId, memberId: a.memberId, role: a.role as MultimediaServiceRole, isManual: false },
          update: { role: a.role as MultimediaServiceRole, isManual: false },
        })
      )
    )

    await db.schedulePeriod.update({
      where: { id: periodId },
      data: { status: 'REVIEW' },
    })

    return NextResponse.json({ success: true, data: validAssignments, warnings, message: "Penugasan berhasil dibuat" })
  } catch (error) {
    console.error('Generate schedule error:', error)
    if (periodId) {
      await db.schedulePeriod.update({
        where: { id: periodId },
        data: { status: 'COLLECTING' },
      }).catch(() => {})
    }
    return NextResponse.json({ success: false, message: "Gagal membuat penugasan" }, { status: 500 })
  }
}
