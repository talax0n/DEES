import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { availabilitySchema } from "@/lib/validations"
import { requireMultimediaAccess } from "@/lib/auth"

const batchSchema = z.object({
  memberId: z.string().min(1),
  submissions: z.array(availabilitySchema).min(1),
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
      const callerMember = await db.multimediaMember.findUnique({ where: { userId: dbUser!.id } })
      if (!callerMember || callerMember.id !== memberId) {
        return NextResponse.json({ error: "Cannot submit availability for another member" }, { status: 403 })
      }
    }

    const results = await Promise.all(
      submissions.map(({ eventId, status, note }) =>
        db.memberAvailability.upsert({
          where: { memberId_eventId: { memberId, eventId } },
          create: { memberId, eventId, status, note },
          update: { status, note },
        })
      )
    )
    return NextResponse.json({ success: true, data: results, message: "Ketersediaan berhasil disimpan" })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal menyimpan ketersediaan" }, { status: 500 })
  }
}
