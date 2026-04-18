import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireMultimediaAdmin } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireMultimediaAdmin()
  if (response) return response

  const { id } = await params

  try {
    const body = await request.json().catch(() => ({}))
    const action = (body as { action?: string }).action

    if (action === 'unpublish') {
      const period = await db.schedulePeriod.update({
        where: { id },
        data: { status: 'REVIEW', publishedAt: null },
      })
      return NextResponse.json({ success: true, data: period, message: "Jadwal berhasil di-unpublish" })
    }

    const period = await db.schedulePeriod.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
    })

    return NextResponse.json({ success: true, data: period, message: "Jadwal berhasil dipublish" })
  } catch (error) {
    console.error('Publish period error:', error)
    return NextResponse.json({ success: false, message: "Gagal mengubah status jadwal" }, { status: 500 })
  }
}
