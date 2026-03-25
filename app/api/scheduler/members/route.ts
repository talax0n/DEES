import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { multimediaMemberSchema } from "@/lib/validations"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  try {
    const data = await db.multimediaMember.findMany({
      where: { isActive: true },
      orderBy: { nama: "asc" },
    })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal memuat data anggota" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const { response } = await requireAuth()
  if (response) return response
  try {
    const body = await request.json()
    const parsed = multimediaMemberSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 })
    }
    const data = await db.multimediaMember.create({ data: parsed.data })
    return NextResponse.json({ success: true, data, message: "Anggota berhasil ditambahkan" }, { status: 201 })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal menambahkan anggota" }, { status: 500 })
  }
}
