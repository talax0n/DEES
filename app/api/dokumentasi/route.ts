import { NextRequest, NextResponse } from "next/server"
import { dokumentasi } from "@/lib/data/dokumentasi"

// GET /api/dokumentasi — return all events
export async function GET() {
  // TODO: Replace with Prisma query in Phase 3
  // const data = await db.dokumentasiEvent.findMany({ orderBy: { tanggal: 'desc' }, include: { photos: true } })
  return NextResponse.json({ data: dokumentasi })
}

// POST /api/dokumentasi — create new event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // TODO: Validate with dokumentasiEventSchema
    // TODO: await db.dokumentasiEvent.create({ data: { namaAcara: body.namaAcara, tanggal: new Date(body.tanggal) } })
    return NextResponse.json(
      { data: body, message: "Event berhasil dibuat" },
      { status: 201 }
    )
  } catch {
    return NextResponse.json({ error: "Gagal membuat event" }, { status: 500 })
  }
}
