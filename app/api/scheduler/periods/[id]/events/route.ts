import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { scheduleEventSchema } from "@/lib/validations"
import { requireMultimediaAccess, requireMultimediaAdmin } from "@/lib/auth"

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { response } = await requireMultimediaAccess()
  if (response) return response
  const { id: periodId } = await params
  try {
    const data = await db.scheduleEvent.findMany({
      where: { periodId },
      orderBy: [{ tanggal: 'asc' }, { order: 'asc' }],
      include: {
        assignments: { include: { member: true } },
      },
    })
    return NextResponse.json({ success: true, data })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal memuat data event" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const { response } = await requireMultimediaAdmin()
  if (response) return response
  const { id: periodId } = await params
  try {
    const body = await request.json()
    if (Array.isArray(body)) {
      const events = []
      for (const item of body) {
        const parsed = scheduleEventSchema.safeParse(item)
        if (!parsed.success) {
          return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 })
        }
        events.push({ ...parsed.data, periodId })
      }
      const result = await db.scheduleEvent.createMany({ data: events })
      return NextResponse.json({ success: true, data: { count: result.count }, message: `${result.count} event berhasil ditambahkan` }, { status: 201 })
    } else {
      const parsed = scheduleEventSchema.safeParse(body)
      if (!parsed.success) {
        return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 })
      }
      const data = await db.scheduleEvent.create({ data: { ...parsed.data, periodId } })
      return NextResponse.json({ success: true, data, message: "Event berhasil ditambahkan" }, { status: 201 })
    }
  } catch {
    return NextResponse.json({ success: false, message: "Gagal menambahkan event" }, { status: 500 })
  }
}
