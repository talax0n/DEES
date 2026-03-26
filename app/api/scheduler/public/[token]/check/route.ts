import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Params {
  params: Promise<{ token: string }>
}

export async function GET(request: NextRequest, { params }: Params) {
  const { token } = await params
  try {
    const period = await db.schedulePeriod.findUnique({
      where: { formToken: token },
    })

    if (!period) {
      return NextResponse.json({ error: "Link tidak valid" }, { status: 404 })
    }

    const memberId = request.nextUrl.searchParams.get('memberId')
    if (!memberId) {
      return NextResponse.json({ error: "memberId wajib diisi" }, { status: 400 })
    }

    const eventIds = await db.scheduleEvent.findMany({
      where: { periodId: period.id },
      select: { id: true },
    })

    const availability = await db.memberAvailability.findMany({
      where: {
        memberId,
        eventId: { in: eventIds.map(e => e.id) },
      },
      select: { eventId: true, status: true },
    })

    return NextResponse.json({ availability })
  } catch {
    return NextResponse.json({ error: "Gagal memuat data ketersediaan" }, { status: 500 })
  }
}
