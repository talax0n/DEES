"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // TODO: Implement authentication (e.g. Supabase Auth signInWithPassword)
    console.log("Login attempt:", { email })
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-off-white">
      <div className="w-full max-w-sm">
        {/* Church logo / branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-navy mb-4">
            <span className="text-2xl font-bold text-white font-serif">DS</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Masuk ke Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">GPIB Damai Sejahtera</p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@gpibdamaisejahtera.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-navy text-white hover:bg-navy/90"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
