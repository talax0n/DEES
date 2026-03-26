import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Params {
  params: Promise<{ token: string }>
}

interface AvailabilityEntry {
  eventId: string
  status: 'AVAILABLE' | 'UNAVAILABLE'
}

export async function POST(request: NextRequest, { params }: Params) {
  const { token } = await params
  try {
    const period = await db.schedulePeriod.findUnique({
      where: { formToken: token },
    })

    if (!period) {
      return NextResponse.json({ error: "Link tidak valid" }, { status: 404 })
    }

    if (!period.formEnabled) {
      return NextResponse.json({ error: "Form sudah ditutup" }, { status: 403 })
    }

    const body = await request.json()
    const { memberId, availability } = body as { memberId: string; availability: AvailabilityEntry[] }

    if (!memberId || !Array.isArray(availability)) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 })
    }

    const now = new Date()
    const upserts = availability.map((entry) =>
      db.memberAvailability.upsert({
        where: { memberId_eventId: { memberId, eventId: entry.eventId } },
        update: { status: entry.status, updatedAt: now },
        create: { memberId, eventId: entry.eventId, status: entry.status },
      })
    )

    await Promise.all(upserts)

    return NextResponse.json({
      success: true,
      message: "Ketersediaan berhasil disimpan",
      count: availability.length,
    })
  } catch {
    return NextResponse.json({ error: "Gagal menyimpan ketersediaan" }, { status: 500 })
  }
}
