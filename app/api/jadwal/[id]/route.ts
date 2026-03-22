import { NextRequest, NextResponse } from "next/server"

interface Params {
  params: Promise<{ id: string }>
}

// PUT /api/jadwal/[id] — update jadwal
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    const body = await request.json()
    // TODO: await db.jadwalIbadah.update({ where: { id }, data: body })
    return NextResponse.json({ data: { id, ...body }, message: "Jadwal berhasil diperbarui" })
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui jadwal" }, { status: 500 })
  }
}

// DELETE /api/jadwal/[id] — delete jadwal
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    // TODO: await db.jadwalIbadah.delete({ where: { id } })
    return NextResponse.json({ message: "Jadwal berhasil dihapus" })
  } catch {
    return NextResponse.json({ error: "Gagal menghapus jadwal" }, { status: 500 })
  }
}
