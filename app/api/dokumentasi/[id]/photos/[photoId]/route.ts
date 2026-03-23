import { NextRequest, NextResponse } from "next/server"

// DELETE /api/dokumentasi/:id/photos/:photoId — delete a photo
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  const { id, photoId } = await params
  // TODO: In Phase 3:
  // const photo = await db.dokumentasiPhoto.findUnique({ where: { id: photoId } })
  // await supabase.storage.from('dokumentasi').remove([photo.imageUrl])
  // await db.dokumentasiPhoto.delete({ where: { id: photoId } })
  return NextResponse.json({ message: `Foto ${photoId} dari event ${id} berhasil dihapus` })
}

// PATCH /api/dokumentasi/:id/photos/:photoId — update photo (caption, order, set cover)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; photoId: string }> }
) {
  const { id, photoId } = await params
  try {
    const body = await request.json()
    // TODO: In Phase 3:
    // await db.dokumentasiPhoto.update({ where: { id: photoId }, data: body })
    // If setting cover: await db.dokumentasiEvent.update({ where: { id }, data: { coverPhoto: photo.imageUrl } })
    return NextResponse.json({
      message: `Foto ${photoId} dari event ${id} berhasil diperbarui`,
      data: body,
    })
  } catch {
    return NextResponse.json({ error: "Gagal memperbarui foto" }, { status: 500 })
  }
}
