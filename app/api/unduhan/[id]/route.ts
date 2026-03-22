import { NextRequest, NextResponse } from "next/server"

interface Params {
  params: Promise<{ id: string }>
}

// DELETE /api/unduhan/[id]
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    // TODO: await db.unduhan.delete({ where: { id } })
    // TODO: Delete file from Supabase Storage
    return NextResponse.json({ message: "Unduhan berhasil dihapus" })
  } catch {
    return NextResponse.json({ error: "Gagal menghapus unduhan" }, { status: 500 })
  }
}
