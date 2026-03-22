import { NextRequest, NextResponse } from "next/server"

// POST /api/upload — handle file upload to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const bucket = formData.get("bucket") as string | null ?? "uploads"

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 })
    }

    // TODO: Implement Supabase Storage upload
    // const { createServerSupabaseClient } = await import("@/lib/supabase")
    // const supabase = createServerSupabaseClient()
    // const fileBuffer = await file.arrayBuffer()
    // const fileName = `${Date.now()}-${file.name}`
    // const { data, error } = await supabase.storage.from(bucket).upload(fileName, fileBuffer, {
    //   contentType: file.type,
    // })
    // if (error) throw error
    // const { data: publicUrl } = supabase.storage.from(bucket).getPublicUrl(data.path)
    // return NextResponse.json({ url: publicUrl.publicUrl, path: data.path })

    return NextResponse.json({ message: "Upload endpoint ready — TODO: connect Supabase Storage" }, { status: 200 })
  } catch {
    return NextResponse.json({ error: "Gagal mengupload file" }, { status: 500 })
  }
}
