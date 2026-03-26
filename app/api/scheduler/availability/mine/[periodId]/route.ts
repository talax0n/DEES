// GET — returns current user's member availability for a period
import { NextResponse } from "next/server"
import { requireMultimediaAccess } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ periodId: string }> }
) {
  const { response } = await requireMultimediaAccess()
  if (response) return response

  const { periodId } = await params
  // MultimediaMember is now standalone; caller must supply their memberId via query param
  const url = new URL(_req.url)
  const memberId = url.searchParams.get('memberId')
  if (!memberId) {
    return NextResponse.json({ data: [] })
  }
  const member = await db.multimediaMember.findUnique({ where: { id: memberId } })
  if (!member) {
    return NextResponse.json({ data: [] })
  }

  const availability = await db.memberAvailability.findMany({
    where: {
      memberId: member.id,
      event: { periodId }
    },
    include: { event: { select: { id: true, namaEvent: true, tanggal: true } } }
  })

  return NextResponse.json({ data: availability })
}
