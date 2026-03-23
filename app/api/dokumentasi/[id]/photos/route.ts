import { NextRequest, NextResponse } from "next/server"

// GET /api/dokumentasi/:id/photos — return photos for event
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // TODO: Replace with Prisma query in Phase 3
  // const photos = await db.dokumentasiPhoto.findMany({ where: { eventId: id }, orderBy: { order: 'asc' } })
  return NextResponse.json({ data: [], eventId: id })
}

// POST /api/dokumentasi/:id/photos — upload photo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    // TODO: In Phase 3 — upload file to Supabase Storage, then save record:
    // const formData = await request.formData()
    // const file = formData.get('file') as File
    // const { data, error } = await supabase.storage.from('dokumentasi').upload(`${id}/${file.name}`, file)
    // const photo = await db.dokumentasiPhoto.create({ data: { eventId: id, imageUrl: data.publicUrl, order: 0 } })
    void request
    return NextResponse.json(
      { message: "Upload foto akan tersedia di Phase 3", eventId: id },
      { status: 501 }
    )
  } catch {
    return NextResponse.json({ error: "Gagal upload foto" }, { status: 500 })
  }
}
