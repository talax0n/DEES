import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireMultimediaAdmin } from "@/lib/auth"

function formatDate(date: Date): string {
  return date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export async function POST(request: NextRequest) {
  const { response } = await requireMultimediaAdmin()
  if (response) return response

  try {
    const body = await request.json()
    const { periodId, type } = body as { periodId: string; type: 'SCHEDULE_PUBLISHED' | 'FORM_LINK' }

    const webhookSetting = await db.appSettings.findUnique({ where: { key: 'whatsapp_webhook_url' } })
    if (!webhookSetting?.value) {
      return NextResponse.json({ success: false, message: "Webhook URL belum dikonfigurasi" }, { status: 400 })
    }
    const webhookUrl = webhookSetting.value

    const period = await db.schedulePeriod.findUnique({
      where: { id: periodId },
      include: {
        events: {
          orderBy: [{ tanggal: 'asc' }, { order: 'asc' }],
          include: {
            assignments: { include: { member: { select: { nama: true } } } },
          },
        },
      },
    })

    if (!period) {
      return NextResponse.json({ success: false, message: "Period tidak ditemukan" }, { status: 404 })
    }

    let message = ''

    if (type === 'FORM_LINK') {
      if (!period.formToken) {
        return NextResponse.json({ success: false, message: "Form belum diaktifkan, tidak ada token tersedia" }, { status: 400 })
      }
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yourdomain.com'
      const formUrl = `${siteUrl}/availability/${period.formToken}`
      const deadlineSetting = await db.appSettings.findUnique({ where: { key: 'availability_deadline' } })
      const deadline = deadlineSetting?.value ?? 'Segera'

      message = `📋 ${period.nama}\nHai Tim Multimedia! Jadwal pelayanan bulan depan sudah dibuat.\nMohon isi ketersediaan kamu di link berikut:\n🔗 ${formUrl}\n⏰ Deadline: ${deadline}\nTerima kasih! GBU 🙏`
    } else {
      // SCHEDULE_PUBLISHED: group events by date
      const byDate = new Map<string, typeof period.events>()
      for (const event of period.events) {
        const dateKey = event.tanggal.toISOString().split('T')[0]
        if (!byDate.has(dateKey)) byDate.set(dateKey, [])
        byDate.get(dateKey)!.push(event)
      }

      const lines: string[] = [`📅 *${period.nama}*\nJadwal Pelayanan Tim Multimedia\n`]
      for (const [, events] of byDate) {
        const firstEvent = events[0]
        lines.push(`\n*${formatDate(firstEvent.tanggal)}*`)
        for (const event of events) {
          lines.push(`🕐 ${event.waktu} — ${event.namaEvent}${event.isLive ? ' 🔴 LIVE' : ''}`)
          for (const assignment of event.assignments) {
            lines.push(`  • ${assignment.role}: ${assignment.member.nama}`)
          }
        }
      }
      lines.push('\nTerima kasih, GBU 🙏')
      message = lines.join('\n')
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type,
        message,
        targets: null,
        metadata: { periodId, periodName: period.nama },
      }),
    })

    return NextResponse.json({ success: true, message: "Broadcast berhasil dikirim" })
  } catch (error) {
    console.error('Broadcast error:', error)
    return NextResponse.json({ success: false, message: "Gagal mengirim broadcast" }, { status: 500 })
  }
}
