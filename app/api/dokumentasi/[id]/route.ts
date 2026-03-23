import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { deleteFile, getPathFromUrl } from "@/lib/storage"

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(
  _request: NextRequest,
  { params }: Params
) {
  const { id } = await params
  try {
    const event = await db.dokumentasiEvent.findUnique({
      where: { id },
      include: { photos: { orderBy: { order: "asc" } } },
    })
    if (!event) {
      return NextResponse.json({ success: false, message: "Event tidak ditemukan" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data: event })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal memuat event" }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: Params
) {
  const { id } = await params
  try {
    const event = await db.dokumentasiEvent.findUnique({
      where: { id },
      include: { photos: true },
    })
    if (!event) {
      return NextResponse.json({ success: false, message: "Event tidak ditemukan" }, { status: 404 })
    }

    // Delete all photos from Supabase Storage (best-effort)
    for (const photo of event.photos) {
      try {
        const path = getPathFromUrl(photo.imageUrl, "images")
        await deleteFile("images", path)
      } catch {
        // continue even if individual deletes fail
      }
    }

    // Delete DB record (photos cascade)
    await db.dokumentasiEvent.delete({ where: { id } })
    return NextResponse.json({ success: true, message: "Event berhasil dihapus" })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal menghapus event" }, { status: 500 })
  }
}
