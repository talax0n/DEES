import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"

/** Returns the authenticated Supabase user, or a 401 response. */
export async function requireAuth() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  return { user, response: null }
}

export async function requireRoles(...requiredRoles: UserRole[]) {
  const { user, response } = await requireAuth()
  if (!user) return { user: null, dbUser: null, response }

  const dbUser = await db.user.findUnique({ where: { id: user.id } })
  if (!dbUser) {
    return { user: null, dbUser: null, response: NextResponse.json({ error: "User not found" }, { status: 403 }) }
  }

  // ADMIN has access to everything
  if (dbUser.roles.includes('ADMIN')) {
    return { user, dbUser, response: null }
  }

  const hasAccess = requiredRoles.some(r => dbUser.roles.includes(r))
  if (!hasAccess) {
    return { user: null, dbUser: null, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }
  }

  return { user, dbUser, response: null }
}

export async function requireCmsAdmin() { return requireRoles('ADMIN') }
export async function requireCmsAccess() { return requireRoles('ADMIN', 'EDITOR') }
export async function requireMultimediaAdmin() { return requireRoles('ADMIN', 'MULTIMEDIA_ADMIN') }
export async function requireMultimediaAccess() { return requireRoles('ADMIN', 'MULTIMEDIA_ADMIN', 'MULTIMEDIA_MEMBER') }

// Backward compat alias — will be removed after all routes are updated
export async function requireAdmin() { return requireCmsAdmin() }
