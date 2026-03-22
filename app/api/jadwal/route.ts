import { NextRequest, NextResponse } from "next/server"
import { jadwalIbadah } from "@/lib/data"

// GET /api/jadwal — return all jadwal ibadah
export async function GET() {
  // TODO: Replace with Prisma query: await db.jadwalIbadah.findMany({ where: { isActive: true } })
  return NextResponse.json({ data: jadwalIbadah })
}

// POST /api/jadwal — create new jadwal
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // TODO: Validate with jadwalSchema from lib/validations.ts
    // TODO: await db.jadwalIbadah.create({ data: body })
    return NextResponse.json({ data: body, message: "Jadwal berhasil ditambahkan" }, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Gagal menambahkan jadwal" }, { status: 500 })
  }
}
