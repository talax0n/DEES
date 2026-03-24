import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { db } from "@/lib/db"

/** Returns the authenticated Supabase user, or a 401 response. */
export async function requireAuth() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }
  }
  return { user, response: null }
}

/** Returns the authenticated user with ADMIN role, or a 401/403 response. */
export async function requireAdmin() {
  const { user, response } = await requireAuth()
  if (!user) return { user: null, response }

  const dbUser = await db.user.findUnique({ where: { id: user.id } })
  if (!dbUser || dbUser.role !== "ADMIN") {
    return {
      user: null,
      response: NextResponse.json({ error: "Forbidden — Admin access required" }, { status: 403 }),
    }
  }
  return { user: dbUser, response: null }
}
