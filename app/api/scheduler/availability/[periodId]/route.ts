import { NextResponse } from "next/server"
import { db } from "@/lib/db"

interface Params {
  params: Promise<{ periodId: string }>
}

export async function GET(_request: Request, { params }: Params) {
  const { periodId } = await params
  try {
    const data = await db.memberAvailability.findMany({
      where: { event: { periodId } },
      include: { member: true, event: true },
      orderBy: { event: { tanggal: "asc" } },
    })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal memuat ketersediaan" }, { status: 500 })
  }
}
