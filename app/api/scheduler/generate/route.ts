import { NextRequest, NextResponse } from "next/server"
import { MultimediaServiceRole } from "@prisma/client"
import { db } from "@/lib/db"
import { requireMultimediaAdmin } from "@/lib/auth"
import { generateLlmText } from "@/lib/llm"

export async function POST(request: NextRequest) {
  const { response } = await requireMultimediaAdmin()
  if (response) return response

  let periodId: string | undefined

  try {
    const body = await request.json()
    periodId = body.periodId as string

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

    const availabilityText = events.map(e => {
      const avail = availabilityData.filter(a => a.eventId === e.id)
      const lines = avail.map(a => `  - ${a.member.nama}: ${a.status}`)
      return `${e.namaEvent} (${e.tanggal.toISOString().split('T')[0]}):\n${lines.join('\n') || '  (no submissions)'}`
    }).join('\n\n')

    const prompt = `You are a scheduling assistant for a church multimedia team.

TEAM MEMBERS:
${members.map(m => `- ${m.nama} (can do: ${m.serviceRoles.join(', ')})`).join('\n')}

EVENTS TO SCHEDULE:
${events.map(e => `- [${e.id}] ${e.namaEvent} on ${e.tanggal.toISOString().split('T')[0]} at ${e.waktu} — needs: ${e.requiredRoles.join(', ')} ${e.isLive ? '(LIVE)' : ''}`).join('\n')}

MEMBER AVAILABILITY:
${availabilityText}

RULES:
1. Only assign members to events where they are AVAILABLE (not UNAVAILABLE)
2. Only assign members to roles they are capable of (check their roles array)
3. Distribute workload fairly — no one person should be assigned to every event
4. For LIVE events, prioritize experienced members for STR and CAM roles
5. Try to avoid assigning the same person to both the 06.00 and 09.00 service on the same day unless necessary
6. Only assign members marked as AVAILABLE; skip UNAVAILABLE members

Respond with ONLY a valid JSON array of assignments (no markdown, no explanation):
[{ "eventId": "...", "memberId": "...", "role": "SLD|SND|STR|CAM" }]`

    const content = await generateLlmText({
      prompt,
      maxTokens: 4000,
    })

    const jsonText = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    const rawAssignments = JSON.parse(jsonText) as Array<{ eventId: string; memberId: string; role: string }>

    const validEventIds = new Set(events.map(e => e.id))
    const validMemberIds = new Set(members.map(m => m.id))
    const validRoles = new Set(['SLD', 'SND', 'STR', 'CAM'])

    const validAssignments = rawAssignments.filter(a =>
      validEventIds.has(a.eventId) &&
      validMemberIds.has(a.memberId) &&
      validRoles.has(a.role)
    )

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

    return NextResponse.json({ success: true, data: validAssignments, message: "Penugasan berhasil dibuat" })
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
