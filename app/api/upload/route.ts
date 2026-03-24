import { NextRequest, NextResponse } from "next/server"
import { uploadFile } from "@/lib/storage"
import { requireAuth } from "@/lib/auth"

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const ALLOWED_DOC_TYPES = ["application/pdf"]
const MAX_IMAGE_SIZE = 5 * 1024 * 1024  // 5MB
const MAX_DOC_SIZE = 10 * 1024 * 1024   // 10MB

export async function POST(request: NextRequest) {
  const { response } = await requireAuth()
  if (response) return response
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const bucket = (formData.get("bucket") as string | null) ?? "documents"
    const folder = (formData.get("folder") as string | null) ?? ""

    if (!file) {
      return NextResponse.json({ success: false, message: "File tidak ditemukan" }, { status: 400 })
    }

    if (bucket === "documents") {
      if (!ALLOWED_DOC_TYPES.includes(file.type)) {
        return NextResponse.json({ success: false, message: "Hanya file PDF yang diizinkan" }, { status: 400 })
      }
      if (file.size > MAX_DOC_SIZE) {
        return NextResponse.json({ success: false, message: "Ukuran file maksimal 10MB" }, { status: 400 })
      }
    } else if (bucket === "images") {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json({ success: false, message: "Hanya file JPG, PNG, atau WebP yang diizinkan" }, { status: 400 })
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return NextResponse.json({ success: false, message: "Ukuran file maksimal 5MB" }, { status: 400 })
      }
    }

    const ext = file.name.split(".").pop()
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const path = folder ? `${folder}/${uniqueName}` : uniqueName

    const url = await uploadFile(bucket as "documents" | "images", path, file)
    return NextResponse.json({ success: true, url, path, size: file.size })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ success: false, message: "Gagal mengupload file" }, { status: 500 })
  }
}
