import { NextRequest, NextResponse } from "next/server"
import { unduhan } from "@/lib/data"

// GET /api/unduhan — return all unduhan, optional ?tipe=TAIB or ?tipe=WARTA filter
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tipe = searchParams.get("tipe")

  // TODO: Replace with Prisma query
  const data = tipe ? unduhan.filter((u: { tipe: string }) => u.tipe === tipe) : unduhan
  return NextResponse.json({ data })
}

// POST /api/unduhan — create new unduhan record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // TODO: Validate with unduhanSchema
    // TODO: await db.unduhan.create({ data: body })
    return NextResponse.json({ data: body, message: "Unduhan berhasil ditambahkan" }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Gagal menambahkan unduhan" }, { status: 500 })
  }
}
