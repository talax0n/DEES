import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { db } from "@/lib/db"
import { schedulePeriodSchema } from "@/lib/validations"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"

const INDONESIAN_MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export async function GET() {
  try {
    const data = await db.schedulePeriod.findMany({
      orderBy: [{ tahun: 'desc' }, { bulan: 'desc' }],
      include: { _count: { select: { events: true } } },
    })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal memuat data periode" }, { status: 500 })
  }
}

const createPeriodSchema = schedulePeriodSchema.extend({
  nama: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const { response } = await requireAuth()
  if (response) return response
  try {
    const body = await request.json()
    const parsed = createPeriodSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 })
    }
    const { nama, bulan, tahun, deadlineAvailability, notes } = parsed.data
    const resolvedNama = nama || `Jadwal ${INDONESIAN_MONTHS[bulan - 1]} ${tahun}`
    const data = await db.schedulePeriod.create({
      data: { nama: resolvedNama, bulan, tahun, deadlineAvailability, notes },
    })
    return NextResponse.json({ success: true, data, message: "Periode berhasil ditambahkan" }, { status: 201 })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ success: false, message: "Jadwal untuk bulan dan tahun ini sudah ada" }, { status: 409 })
    }
    return NextResponse.json({ success: false, message: "Gagal menambahkan periode" }, { status: 500 })
  }
}
