import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { deleteFile, getPathFromUrl } from "@/lib/storage"

interface Params {
  params: Promise<{ id: string }>
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params
  try {
    const record = await db.unduhan.findUnique({ where: { id } })
    if (!record) {
      return NextResponse.json({ success: false, message: "Unduhan tidak ditemukan" }, { status: 404 })
    }
    await db.unduhan.delete({ where: { id } })
    // Delete file from Supabase Storage (best-effort)
    try {
      const path = getPathFromUrl(record.fileUrl, "documents")
      await deleteFile("documents", path)
    } catch {
      // File may not exist in storage — continue
    }
    return NextResponse.json({ success: true, message: "Unduhan berhasil dihapus" })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal menghapus unduhan" }, { status: 500 })
  }
}
