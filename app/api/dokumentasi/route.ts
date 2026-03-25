import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { dokumentasiEventSchema } from "@/lib/validations"
import { requireCmsAccess } from "@/lib/auth"

export async function GET() {
  try {
    const data = await db.dokumentasiEvent.findMany({
      orderBy: { tanggal: "desc" },
      include: { _count: { select: { photos: true } } },
    })
    const events = data.map((e) => ({
      id: e.id,
      namaAcara: e.namaAcara,
      tanggal: e.tanggal,
      coverPhoto: e.coverPhoto,
      totalFoto: e._count.photos,
    }))
    return NextResponse.json({ success: true, data: events })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal memuat data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { response } = await requireCmsAccess()
  if (response) return response
  try {
    const body = await request.json()
    const parsed = dokumentasiEventSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 })
    }
    const data = await db.dokumentasiEvent.create({
      data: { namaAcara: parsed.data.namaAcara, tanggal: parsed.data.tanggal },
    })
    return NextResponse.json({ success: true, data, message: "Event berhasil dibuat" }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal membuat event" }, { status: 500 })
  }
}
