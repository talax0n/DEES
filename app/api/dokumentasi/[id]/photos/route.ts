import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { uploadFile } from "@/lib/storage"
import { requireAuth } from "@/lib/auth"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 5 * 1024 * 1024

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(
  _request: NextRequest,
  { params }: Params
) {
  const { id } = await params
  try {
    const photos = await db.dokumentasiPhoto.findMany({
      where: { eventId: id },
      orderBy: { order: "asc" },
    })
    return NextResponse.json({ success: true, data: photos })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal memuat foto" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: Params
) {
  const { response } = await requireAuth()
  if (response) return response
  const { id } = await params
  try {
    const event = await db.dokumentasiEvent.findUnique({ where: { id } })
    if (!event) {
      return NextResponse.json({ success: false, message: "Event tidak ditemukan" }, { status: 404 })
    }

    const formData = await request.formData()
    const files = formData.getAll("files") as File[]
    if (!files.length) {
      return NextResponse.json({ success: false, message: "Tidak ada file dipilih" }, { status: 400 })
    }

    // Validate all files first
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json({ success: false, message: `File ${file.name}: hanya JPG, PNG, atau WebP` }, { status: 400 })
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ success: false, message: `File ${file.name}: ukuran maksimal 5MB` }, { status: 400 })
      }
    }

    const existingCount = await db.dokumentasiPhoto.count({ where: { eventId: id } })
    const created = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const ext = file.name.split(".").pop()
      const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const path = `kegiatan/${id}/${uniqueName}`

      const imageUrl = await uploadFile("images", path, file)
      const photo = await db.dokumentasiPhoto.create({
        data: {
          eventId: id,
          imageUrl,
          order: existingCount + i,
        },
      })
      created.push(photo)
    }

    // Auto-set cover if event has none
    if (!event.coverPhoto && created.length > 0) {
      await db.dokumentasiEvent.update({
        where: { id },
        data: { coverPhoto: created[0].imageUrl },
      })
    }

    return NextResponse.json({ success: true, data: created, message: `${created.length} foto berhasil diupload` }, { status: 201 })
  } catch (err) {
    console.error("Photo upload error:", err)
    return NextResponse.json({ success: false, message: "Gagal mengupload foto" }, { status: 500 })
  }
}
