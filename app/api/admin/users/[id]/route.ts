import { NextResponse } from "next/server"
import { requireCmsAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireCmsAdmin()
  if (response) return response

  const { id } = await params
  const body = await req.json()
  const { name, roles } = body as { name?: string; roles?: UserRole[] }

  const user = await db.user.update({
    where: { id },
    data: { ...(name !== undefined && { name }), ...(roles && { roles }) }
  })

  // Auto-create MultimediaMember if multimedia roles added
  if (roles && (roles.includes('MULTIMEDIA_ADMIN') || roles.includes('MULTIMEDIA_MEMBER'))) {
    await db.multimediaMember.upsert({
      where: { userId: id },
      update: {},
      create: { userId: id, nama: user.name ?? user.email, roles: [] }
    })
  }

  return NextResponse.json({ data: user })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { response } = await requireCmsAdmin()
  if (response) return response

  const { id } = await params
  await db.user.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
