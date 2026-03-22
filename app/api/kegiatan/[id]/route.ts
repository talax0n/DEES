import { NextRequest, NextResponse } from "next/server"

interface Params {
  params: Promise<{ id: string }>
}

// GET /api/kegiatan/[id]
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    // TODO: await db.kegiatan.findUnique({ where: { id }, include: { galeri: true } })
    return NextResponse.json({ data: { id } })
  } catch {
    return NextResponse.json({ error: "Kegiatan tidak ditemukan" }, { status: 404 })
  }
}

// PUT /api/kegiatan/[id]
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    const body = await request.json()
    // TODO: await db.kegiatan.update({ where: { id }, data: body })
    return NextResponse.json({ data: { id, ...body }, message: "Kegiatan berhasil diperbarui" })
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui kegiatan" }, { status: 500 })
  }
}

// DELETE /api/kegiatan/[id]
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    // TODO: await db.kegiatan.delete({ where: { id } })
    // TODO: Delete associated gallery images from Supabase Storage
    return NextResponse.json({ message: "Kegiatan berhasil dihapus" })
  } catch {
    return NextResponse.json({ error: "Gagal menghapus kegiatan" }, { status: 500 })
  }
}
