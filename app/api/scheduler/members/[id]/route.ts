import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { multimediaMemberSchema } from "@/lib/validations"
import { requireMultimediaAdmin } from "@/lib/auth"

interface Params {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { response } = await requireMultimediaAdmin()
  if (response) return response
  const { id } = await params
  try {
    const body = await request.json()
    const parsed = multimediaMemberSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 })
    }
    const data = await db.multimediaMember.update({ where: { id }, data: parsed.data })
    return NextResponse.json({ success: true, data, message: "Anggota berhasil diperbarui" })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal memperbarui anggota" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { response } = await requireMultimediaAdmin()
  if (response) return response
  const { id } = await params
  try {
    await db.multimediaMember.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ success: true, message: "Anggota berhasil dihapus" })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal menghapus anggota" }, { status: 500 })
  }
}
