import { NextRequest, NextResponse } from "next/server"
import { kegiatan } from "@/lib/data"

// GET /api/kegiatan — return all kegiatan, optional ?published=true filter
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const publishedOnly = searchParams.get("published") === "true"

  // TODO: Replace with Prisma query
  // const data = publishedOnly
  //   ? await db.kegiatan.findMany({ where: { isPublished: true }, orderBy: { tanggal: 'desc' } })
  //   : await db.kegiatan.findMany({ orderBy: { tanggal: 'desc' } })
  return NextResponse.json({ data: kegiatan })
}

// POST /api/kegiatan — create new kegiatan
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // TODO: Validate with kegiatanSchema
    // TODO: await db.kegiatan.create({ data: body })
    return NextResponse.json({ data: body, message: "Kegiatan berhasil ditambahkan" }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Gagal menambahkan kegiatan" }, { status: 500 })
  }
}
