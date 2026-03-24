"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import type { User } from "@supabase/supabase-js"

type Role = "ADMIN" | "EDITOR"

interface AuthUser {
  id: string
  email: string
  name: string | null
  role: Role
}

interface AuthContextValue {
  user: AuthUser | null
  supabaseUser: User | null
  role: Role | null
  isLoading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  supabaseUser: null,
  role: null,
  isLoading: true,
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createSupabaseBrowserClient()

  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const json = await res.json()
        setUser(json.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile().finally(() => setIsLoading(false))
      } else {
        setIsLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null)
      if (session?.user) {
        fetchUserProfile()
      } else {
        setUser(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, fetchUserProfile])

  async function signOut() {
    await supabase.auth.signOut()
    router.push("/admin/login")
  }

  return (
    <AuthContext.Provider value={{ user, supabaseUser, role: user?.role ?? null, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
