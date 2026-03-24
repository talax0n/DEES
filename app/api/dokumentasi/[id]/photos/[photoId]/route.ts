import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { deleteFile, getPathFromUrl } from "@/lib/storage"
import { requireAdmin, requireAuth } from "@/lib/auth"

interface Params {
  params: Promise<{ id: string; photoId: string }>
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { response } = await requireAdmin()
  if (response) return response
  const { id, photoId } = await params
  try {
    const photo = await db.dokumentasiPhoto.findUnique({ where: { id: photoId } })
    if (!photo) {
      return NextResponse.json({ success: false, message: "Foto tidak ditemukan" }, { status: 404 })
    }
    await db.dokumentasiPhoto.delete({ where: { id: photoId } })

    // Remove from Supabase Storage (best-effort)
    try {
      const path = getPathFromUrl(photo.imageUrl, "images")
      await deleteFile("images", path)
    } catch {
      // continue
    }

    // If this was the cover photo, clear it or set next available
    const event = await db.dokumentasiEvent.findUnique({
      where: { id },
      include: { photos: { orderBy: { order: "asc" }, take: 1 } },
    })
    if (event?.coverPhoto === photo.imageUrl) {
      await db.dokumentasiEvent.update({
        where: { id },
        data: { coverPhoto: event.photos[0]?.imageUrl ?? null },
      })
    }

    return NextResponse.json({ success: true, message: "Foto berhasil dihapus" })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal menghapus foto" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { response } = await requireAuth()
  if (response) return response
  const { id, photoId } = await params
  try {
    const body = await request.json()
    const photo = await db.dokumentasiPhoto.update({
      where: { id: photoId },
      data: {
        ...(body.caption !== undefined && { caption: body.caption }),
        ...(body.order !== undefined && { order: body.order }),
      },
    })

    // If setting as cover, update event
    if (body.setCover) {
      await db.dokumentasiEvent.update({
        where: { id },
        data: { coverPhoto: photo.imageUrl },
      })
    }

    return NextResponse.json({ success: true, data: photo, message: "Foto berhasil diperbarui" })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal memperbarui foto" }, { status: 500 })
  }
}
