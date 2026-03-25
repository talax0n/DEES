// GET — returns current user's assignments for a period
import { NextResponse } from "next/server"
import { requireMultimediaAccess } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ periodId: string }> }
) {
  const { dbUser, response } = await requireMultimediaAccess()
  if (response) return response

  const { periodId } = await params
  const member = await db.multimediaMember.findUnique({
    where: { userId: dbUser!.id }
  })
  if (!member) {
    return NextResponse.json({ data: [] })
  }

  const assignments = await db.scheduleAssignment.findMany({
    where: {
      memberId: member.id,
      event: { periodId }
    },
    include: {
      event: {
        select: {
          id: true, namaEvent: true, tanggal: true,
          waktu: true, kategori: true, keterangan: true
        }
      }
    },
    orderBy: { event: { tanggal: 'asc' } }
  })

  return NextResponse.json({ data: assignments })
}
