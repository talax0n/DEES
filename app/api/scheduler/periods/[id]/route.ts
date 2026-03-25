import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireMultimediaAccess, requireMultimediaAdmin } from "@/lib/auth"
import { z } from "zod"

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { response } = await requireMultimediaAccess()
  if (response) return response
  const { id } = await params
  try {
    const data = await db.schedulePeriod.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: [{ tanggal: 'asc' }, { order: 'asc' }],
          include: {
            assignments: { include: { member: true } },
            _count: { select: { availability: true } },
          },
        },
      },
    })
    if (!data) {
      return NextResponse.json({ success: false, message: "Periode tidak ditemukan" }, { status: 404 })
    }
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal memuat data periode" }, { status: 500 })
  }
}

const patchSchema = z.object({
  status: z.enum(['DRAFT', 'COLLECTING', 'GENERATING', 'REVIEW', 'PUBLISHED']).optional(),
  deadlineAvailability: z.coerce.date().optional().nullable(),
  notes: z.string().optional(),
  nama: z.string().optional(),
  publishedAt: z.coerce.date().optional().nullable(),
})

export async function PATCH(request: NextRequest, { params }: Params) {
  const { response } = await requireMultimediaAdmin()
  if (response) return response
  const { id } = await params
  try {
    const body = await request.json()
    const parsed = patchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 })
    }
    const data = await db.schedulePeriod.update({ where: { id }, data: parsed.data })
    return NextResponse.json({ success: true, data, message: "Periode berhasil diperbarui" })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal memperbarui periode" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { response } = await requireMultimediaAdmin()
  if (response) return response
  const { id } = await params
  try {
    await db.schedulePeriod.delete({ where: { id } })
    return NextResponse.json({ success: true, message: "Periode berhasil dihapus" })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal menghapus periode" }, { status: 500 })
  }
}
