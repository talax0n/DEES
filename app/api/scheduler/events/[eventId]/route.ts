import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { scheduleEventSchema } from "@/lib/validations"
import { requireMultimediaAdmin } from "@/lib/auth"

interface Params {
  params: Promise<{ eventId: string }>
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { response } = await requireMultimediaAdmin()
  if (response) return response
  const { eventId } = await params
  try {
    const body = await request.json()
    const parsed = scheduleEventSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 })
    }
    const data = await db.scheduleEvent.update({ where: { id: eventId }, data: parsed.data })
    return NextResponse.json({ success: true, data, message: "Event berhasil diperbarui" })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal memperbarui event" }, { status: 500 })
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { response } = await requireMultimediaAdmin()
  if (response) return response
  const { eventId } = await params
  try {
    await db.scheduleEvent.delete({ where: { id: eventId } })
    return NextResponse.json({ success: true, message: "Event berhasil dihapus" })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal menghapus event" }, { status: 500 })
  }
}
