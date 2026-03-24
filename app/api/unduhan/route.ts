import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { unduhanSchema } from "@/lib/validations"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipe = searchParams.get("tipe")
    const data = await db.unduhan.findMany({
      where: tipe ? { tipe } : undefined,
      orderBy: { tanggal: "desc" },
    })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal memuat data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { response } = await requireAuth()
  if (response) return response
  try {
    const body = await request.json()
    const parsed = unduhanSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 })
    }
    if (!body.fileUrl) {
      return NextResponse.json({ success: false, message: "URL file wajib diisi" }, { status: 400 })
    }
    const data = await db.unduhan.create({
      data: {
        judul: parsed.data.judul,
        tipe: parsed.data.tipe,
        tanggal: parsed.data.tanggal,
        fileUrl: body.fileUrl,
        fileSize: body.fileSize ?? null,
      },
    })
    return NextResponse.json({ success: true, data, message: "Unduhan berhasil ditambahkan" }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal menambahkan unduhan" }, { status: 500 })
  }
}
