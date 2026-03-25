import { NextResponse } from "next/server"
import { requireCmsAdmin } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

export async function GET() {
  const { response } = await requireCmsAdmin()
  if (response) return response

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { multimediaMember: { select: { id: true, nama: true } } }
  })

  return NextResponse.json({ data: users })
}

export async function POST(req: Request) {
  const { response } = await requireCmsAdmin()
  if (response) return response

  const body = await req.json()
  const { id, email, name, roles } = body as {
    id: string; email: string; name?: string; roles: UserRole[]
  }

  if (!id || !email || !roles?.length) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const user = await db.user.create({
    data: { id, email, name, roles }
  })

  // Auto-create MultimediaMember if multimedia roles assigned
  if (roles.includes('MULTIMEDIA_ADMIN') || roles.includes('MULTIMEDIA_MEMBER')) {
    await db.multimediaMember.upsert({
      where: { userId: id },
      update: {},
      create: { userId: id, nama: name ?? email, roles: [] }
    })
  }

  return NextResponse.json({ data: user }, { status: 201 })
}
