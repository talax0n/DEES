import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { jadwalSchema } from "@/lib/validations"

interface Params {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    const body = await request.json()
    const parsed = jadwalSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 })
    }
    const data = await db.jadwalIbadah.update({ where: { id }, data: parsed.data })
    return NextResponse.json({ success: true, data, message: "Jadwal berhasil diperbarui" })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal memperbarui jadwal" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    await db.jadwalIbadah.delete({ where: { id } })
    return NextResponse.json({ success: true, message: "Jadwal berhasil dihapus" })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal menghapus jadwal" }, { status: 500 })
  }
}
