"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import type { User } from "@supabase/supabase-js"

type UserRole = 'ADMIN' | 'EDITOR' | 'MULTIMEDIA_ADMIN' | 'MULTIMEDIA_MEMBER'

interface AuthUser {
  id: string
  email: string
  name: string | null
  roles: UserRole[]
  multimediaMemberId?: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  supabaseUser: User | null
  roles: UserRole[]
  isLoading: boolean
  signOut: () => Promise<void>
  hasRole: (role: UserRole) => boolean
  hasCmsAccess: boolean
  hasMultimediaAccess: boolean
  isMultimediaAdmin: boolean
  isMultimediaMember: boolean
  canDeleteCms: boolean
  canSwitchDashboard: boolean
  activeDashboard: 'cms' | 'multimedia'
  setActiveDashboard: (d: 'cms' | 'multimedia') => void
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  supabaseUser: null,
  roles: [],
  isLoading: true,
  signOut: async () => {},
  hasRole: () => false,
  hasCmsAccess: false,
  hasMultimediaAccess: false,
  isMultimediaAdmin: false,
  isMultimediaMember: false,
  canDeleteCms: false,
  canSwitchDashboard: false,
  activeDashboard: 'cms',
  setActiveDashboard: () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeDashboard, setActiveDashboardState] = useState<'cms' | 'multimedia'>('cms')
  const supabase = createSupabaseBrowserClient()

  const fetchUserProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const json = await res.json()
        setUser(json.user)
        const userRoles: UserRole[] = json.user.roles
        const hasCms = userRoles.includes('ADMIN') || userRoles.includes('EDITOR')
        const hasMm = userRoles.includes('ADMIN') || userRoles.includes('MULTIMEDIA_ADMIN') || userRoles.includes('MULTIMEDIA_MEMBER')
        const stored = localStorage.getItem('admin-active-dashboard') as 'cms' | 'multimedia' | null
        if (stored === 'cms' && !hasCms) setActiveDashboardState('multimedia')
        else if (stored === 'multimedia' && !hasMm) setActiveDashboardState('cms')
        else if (!stored) setActiveDashboardState(hasCms ? 'cms' : 'multimedia')
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    }
  }, [])

  // Re-evaluate activeDashboard whenever user changes
  useEffect(() => {
    const roles: UserRole[] = user?.roles ?? []
    const hasCms = roles.includes('ADMIN') || roles.includes('EDITOR')
    const hasMultimedia = roles.includes('ADMIN') || roles.includes('MULTIMEDIA_ADMIN') || roles.includes('MULTIMEDIA_MEMBER')

    const stored = typeof window !== 'undefined' ? localStorage.getItem('admin-active-dashboard') : null
    if (stored === 'cms' && hasCms) {
      setActiveDashboardState('cms')
    } else if (stored === 'multimedia' && hasMultimedia) {
      setActiveDashboardState('multimedia')
    } else {
      // Reset to default
      setActiveDashboardState(hasCms ? 'cms' : 'multimedia')
    }
  }, [user])

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
    router.push("/login")
  }

  const roles: UserRole[] = user?.roles ?? []

  const hasRole = (role: UserRole) => user?.roles.includes(role) ?? false

  const hasCmsAccess = hasRole('ADMIN') || hasRole('EDITOR')
  const hasMultimediaAccess = hasRole('ADMIN') || hasRole('MULTIMEDIA_ADMIN') || hasRole('MULTIMEDIA_MEMBER')
  const isMultimediaAdmin = hasRole('ADMIN') || hasRole('MULTIMEDIA_ADMIN')
  const isMultimediaMember = hasMultimediaAccess
  const canDeleteCms = hasRole('ADMIN')
  const canSwitchDashboard = hasCmsAccess && hasMultimediaAccess

  function setActiveDashboard(d: 'cms' | 'multimedia') {
    setActiveDashboardState(d)
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-active-dashboard', d)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      supabaseUser,
      roles,
      isLoading,
      signOut,
      hasRole,
      hasCmsAccess,
      hasMultimediaAccess,
      isMultimediaAdmin,
      isMultimediaMember,
      canDeleteCms,
      canSwitchDashboard,
      activeDashboard,
      setActiveDashboard,
    }}>
      {children}
    </AuthContext.Provider>
  )
}
