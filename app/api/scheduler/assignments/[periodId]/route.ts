import { NextRequest, NextResponse } from "next/server"
import { MultimediaServiceRole } from "@prisma/client"
import { db } from "@/lib/db"
import { requireMultimediaAdmin } from "@/lib/auth"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ periodId: string }> }
) {
  const { response } = await requireMultimediaAdmin()
  if (response) return response

  const { periodId } = await params

  try {
    const assignments = await db.scheduleAssignment.findMany({
      where: { event: { periodId } },
      include: {
        member: { select: { id: true, nama: true, serviceRoles: true } },
        event: { select: { id: true, namaEvent: true, tanggal: true, waktu: true, kategori: true } },
      },
      orderBy: { event: { tanggal: 'asc' } },
    })

    return NextResponse.json({ success: true, data: assignments })
  } catch (error) {
    console.error('Get assignments error:', error)
    return NextResponse.json({ success: false, message: "Gagal mengambil data penugasan" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ periodId: string }> }
) {
  const { response } = await requireMultimediaAdmin()
  if (response) return response

  const { periodId } = await params

  try {
    const body = await request.json()
    const { assignments } = body as {
      assignments: Array<{ eventId: string; memberId: string; role: string; isManual?: boolean }>
    }

    // Get all event IDs for this period
    const events = await db.scheduleEvent.findMany({
      where: { periodId },
      select: { id: true },
    })
    const eventIds = events.map(e => e.id)

    // Delete all existing assignments for this period
    await db.scheduleAssignment.deleteMany({
      where: { eventId: { in: eventIds } },
    })

    // Insert new assignments
    const created = await db.scheduleAssignment.createMany({
      data: assignments.map(a => ({
        eventId: a.eventId,
        memberId: a.memberId,
        role: a.role as MultimediaServiceRole,
        isManual: a.isManual ?? true,
      })),
    })

    return NextResponse.json({ success: true, data: { count: created.count }, message: "Penugasan berhasil diperbarui" })
  } catch (error) {
    console.error('Update assignments error:', error)
    return NextResponse.json({ success: false, message: "Gagal memperbarui penugasan" }, { status: 500 })
  }
}
