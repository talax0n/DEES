import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let dbUser = await db.user.findUnique({
      where: { id: user.id },
    })

    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          id: user.id,
          email: user.email!,
          roles: ['EDITOR'],
        },
      })
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        roles: dbUser.roles,
      },
    })
  } catch(error) {
    // return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    return NextResponse.json({ error: error }, { status: 500 })
  }
}
