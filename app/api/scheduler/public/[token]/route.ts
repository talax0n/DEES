import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Params {
  params: Promise<{ token: string }>
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { token } = await params
  try {
    const period = await db.schedulePeriod.findUnique({
      where: { formToken: token },
    })

    if (!period) {
      return NextResponse.json({ error: "Link tidak valid" }, { status: 404 })
    }

    if (!period.formEnabled) {
      return NextResponse.json({ closed: true, message: "Form ditutup. Terima kasih!" })
    }

    const [events, members] = await Promise.all([
      db.scheduleEvent.findMany({
        where: { periodId: period.id },
        orderBy: [{ tanggal: 'asc' }, { order: 'asc' }],
      }),
      db.multimediaMember.findMany({
        where: { isActive: true },
        orderBy: { nama: 'asc' },
      }),
    ])

    return NextResponse.json({ period, events, members })
  } catch {
    return NextResponse.json({ error: "Gagal memuat data form" }, { status: 500 })
  }
}
