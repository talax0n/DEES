import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { requireAuth } from "@/lib/auth"

const assignmentItemSchema = z.object({
  eventId: z.string().min(1),
  memberId: z.string().min(1),
  role: z.enum(["SLD", "SND", "STR", "CAM"]),
  isManual: z.boolean().default(false),
})

const batchSchema = z.object({
  assignments: z.array(assignmentItemSchema).min(1),
})

export async function POST(request: NextRequest) {
  const { response } = await requireAuth()
  if (response) return response
  try {
    const body = await request.json()
    const parsed = batchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, message: parsed.error.issues[0].message }, { status: 400 })
    }
    const results = await Promise.all(
      parsed.data.assignments.map(({ eventId, memberId, role, isManual }) =>
        db.scheduleAssignment.upsert({
          where: { eventId_memberId: { eventId, memberId } },
          create: { eventId, memberId, role, isManual: isManual ?? false },
          update: { role, isManual: isManual ?? false },
        })
      )
    )
    return NextResponse.json({ success: true, data: results, message: "Assignment berhasil disimpan" })
  } catch {
    return NextResponse.json({ success: false, message: "Gagal menyimpan assignment" }, { status: 500 })
  }
}
