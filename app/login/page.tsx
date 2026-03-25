"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"
import Image from "next/image"
import { Loader2 } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const redirect = searchParams.get("redirect") ?? "/admin"
        router.replace(redirect)
      }
    })
  }, [supabase, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const redirect = searchParams.get("redirect") ?? "/admin"
      router.replace(redirect)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login gagal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white/90 font-medium">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@gpibdamaisejahtera.org"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:bg-white/10 focus-visible:ring-gold/50 h-11 transition-all rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-white/90 font-medium">Password</Label>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:bg-white/10 focus-visible:ring-gold/50 h-11 transition-all rounded-xl"
        />
      </div>
      <Button
        type="submit"
        className="w-full bg-gold text-navy hover:bg-gold/90 font-semibold h-11 transition-all rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_25px_rgba(212,175,55,0.5)] mt-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          "Masuk"
        )}
      </Button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-navy selection:bg-gold/30 selection:text-white">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/INTERIOR.jpg" 
          alt="GPIB Damai Sejahtera" 
          fill 
          className="object-cover opacity-30 mix-blend-luminosity"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-navy via-navy/90 to-navy/60 backdrop-blur-[2px]" />
      </div>

      {/* Decorative blurred shapes */}
      <div className="absolute top-[-10%] -left-10 w-96 h-96 bg-gold/20 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Login Card Container */}
      <div className="relative z-10 w-full max-w-[420px] px-6 py-12 flex flex-col items-center">
        {/* Logo & Title */}
        <div className="mb-8 text-center flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-20 h-20 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 shadow-2xl flex items-center justify-center mb-6 p-3 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <Image 
              src="/LOGO.png" 
              alt="Logo" 
              width={64} 
              height={64} 
              className="object-contain drop-shadow-lg transform group-hover:scale-105 transition-transform duration-500" 
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white font-serif drop-shadow-sm">Admin Portal</h1>
          <p className="text-white/60 mt-2 text-sm font-medium tracking-wide uppercase">GPIB Damai Sejahtera</p>
        </div>

        {/* Glassmorphic Form Card */}
        <div className="w-full bg-white/[0.03] backdrop-blur-2xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-3xl p-8 sm:p-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150 fill-mode-both">
          <Suspense fallback={<div className="h-[212px] flex flex-col items-center justify-center gap-3 text-sm text-white/50"><Loader2 className="w-5 h-5 animate-spin" />Memuat form...</div>}>
            <LoginForm />
          </Suspense>
        </div>
        
        {/* Footer */}
        <div className="mt-10 text-center text-xs text-white/40 animate-in fade-in duration-1000 delay-300 fill-mode-both">
          &copy; {new Date().getFullYear()} GPIB Damai Sejahtera.<br/>All rights reserved.
        </div>
      </div>
    </div>
  )
}
