import { NextRequest, NextResponse } from "next/server"
import { dokumentasi } from "@/lib/data/dokumentasi"

// GET /api/dokumentasi/:id — return single event
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // TODO: Replace with Prisma query in Phase 3
  // const event = await db.dokumentasiEvent.findUnique({ where: { id }, include: { photos: true } })
  const event = dokumentasi.find((d) => d.id === id)
  if (!event) {
    return NextResponse.json({ error: "Event tidak ditemukan" }, { status: 404 })
  }
  return NextResponse.json({ data: event })
}

// DELETE /api/dokumentasi/:id — delete event and cascade photos
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // TODO: await db.dokumentasiEvent.delete({ where: { id } }) — photos cascade via onDelete: Cascade
  return NextResponse.json({ message: `Event ${id} berhasil dihapus` })
}
