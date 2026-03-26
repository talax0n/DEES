import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireMultimediaAccess } from "@/lib/auth"

const submissionItemSchema = z.object({
  eventId: z.string().min(1),
  status: z.enum(['AVAILABLE', 'UNAVAILABLE']),
})

const batchSchema = z.object({
  memberId: z.string().min(1),
  submissions: z.array(submissionItemSchema).min(1),
})

export async function POST(request: NextRequest) {
  const { response, dbUser } = await requireMultimediaAccess()
  if (response) return response
  try {
    const body = await request.json()
    const parsed = batchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 })
    }
    const { memberId, submissions } = parsed.data

    const isAdmin = dbUser!.roles.includes('ADMIN') || dbUser!.roles.includes('MULTIMEDIA_ADMIN')
    if (!isAdmin) {
      // Non-admins must explicitly identify themselves via memberId in request body
      // and only admins can submit for arbitrary members
      return NextResponse.json({ error: "Only admins can submit availability for members" }, { status: 403 })
    }

    const results = await Promise.all(
      submissions.map(({ eventId, status }) =>
        db.memberAvailability.upsert({
          where: { memberId_eventId: { memberId, eventId } },
          create: { memberId, eventId, status },
          update: { status },
        })
      )
    )
    return NextResponse.json({ success: true, data: results, message: "Ketersediaan berhasil disimpan" })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal menyimpan ketersediaan" }, { status: 500 })
  }
}
