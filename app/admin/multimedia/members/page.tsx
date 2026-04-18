"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PageHeader } from "@/components/admin/PageHeader"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { 
  Loader2, 
  Plus, 
  Pencil, 
  UserX, 
  Link2, 
  Users as UsersIcon, 
  Phone, 
  Mail, 
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/AuthProvider"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type MultimediaServiceRole = "SLD" | "SND" | "STR" | "CAM"

type Member = {
  id: string
  nama: string
  phone: string | null
  serviceRoles: MultimediaServiceRole[]
  isActive: boolean
  userId: string | null
}

const ALL_ROLES: MultimediaServiceRole[] = ["SLD", "SND", "STR", "CAM"]
const ROLE_LABELS: Record<MultimediaServiceRole, string> = {
  SLD: "Operator Slide",
  SND: "Operator Sound",
  STR: "Streamer",
  CAM: "Cameraman",
}
const ROLE_CLASS: Record<MultimediaServiceRole, string> = {
  SLD: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  SND: "bg-green-500/10 text-green-600 border-green-500/20",
  STR: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  CAM: "bg-orange-500/10 text-orange-600 border-orange-500/20",
}

const defaultForm = { nama: "", phone: "", serviceRoles: [] as MultimediaServiceRole[], userId: "" }

export default function MultimediaMembersPage() {
  const router = useRouter()
  const { isMultimediaAdmin, isLoading: authLoading } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [form, setForm] = useState(defaultForm)
  const [saving, setSaving] = useState(false)

  // Link user dialog
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [linkingMember, setLinkingMember] = useState<Member | null>(null)
  const [linkUserId, setLinkUserId] = useState("")
  const [linkSaving, setLinkSaving] = useState(false)

  useEffect(() => {
    if (!authLoading && !isMultimediaAdmin) {
      router.replace("/admin/multimedia")
    }
  }, [authLoading, isMultimediaAdmin, router])

  async function fetchMembers() {
    setLoading(true)
    try {
      const res = await fetch("/api/scheduler/members")
      const json = await res.json()
      if (json.success) setMembers(json.data)
      else toast.error("Gagal memuat data anggota")
    } catch {
      toast.error("Gagal memuat data anggota")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading || !isMultimediaAdmin) return
    fetchMembers()
  }, [authLoading, isMultimediaAdmin])

  function openAdd() {
    setEditingMember(null)
    setForm(defaultForm)
    setDialogOpen(true)
  }

  function openEdit(member: Member) {
    setEditingMember(member)
    setForm({ nama: member.nama, phone: member.phone ?? "", serviceRoles: [...member.serviceRoles], userId: member.userId ?? "" })
    setDialogOpen(true)
  }

  function openLinkUser(member: Member) {
    setLinkingMember(member)
    setLinkUserId(member.userId ?? "")
    setLinkDialogOpen(true)
  }

  function toggleRole(role: MultimediaServiceRole) {
    setForm(f => ({
      ...f,
      serviceRoles: f.serviceRoles.includes(role) ? f.serviceRoles.filter(r => r !== role) : [...f.serviceRoles, role],
    }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (form.serviceRoles.length === 0) { toast.error("Pilih minimal 1 role"); return }

    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        nama: form.nama,
        phone: form.phone || undefined,
        serviceRoles: form.serviceRoles,
      }
      const url = editingMember ? `/api/scheduler/members/${editingMember.id}` : "/api/scheduler/members"
      const method = editingMember ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const json = await res.json()

      if (json.success) {
        toast.success(editingMember ? "Anggota berhasil diperbarui" : "Anggota berhasil ditambahkan")
        setDialogOpen(false)
        fetchMembers()
      } else {
        toast.error(json.message ?? "Gagal menyimpan anggota")
      }
    } catch {
      toast.error("Gagal menyimpan anggota")
    } finally {
      setSaving(false)
    }
  }

  async function handleLinkUser(e: React.FormEvent) {
    e.preventDefault()
    if (!linkingMember) return
    setLinkSaving(true)
    try {
      const res = await fetch(`/api/scheduler/members/${linkingMember.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: linkUserId || null }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success("Akun pengguna berhasil ditautkan")
        setLinkDialogOpen(false)
        setLinkingMember(null)
        fetchMembers()
      } else {
        toast.error(json.message ?? "Gagal menautkan akun")
      }
    } catch {
      toast.error("Gagal menautkan akun")
    } finally {
      setLinkSaving(false)
    }
  }

  async function handleDeactivate(member: Member) {
    if (!confirm(`Nonaktifkan ${member.nama}? Mereka tidak akan muncul di daftar penugasan.`)) return
    try {
      const res = await fetch(`/api/scheduler/members/${member.id}`, { method: "DELETE" })
      const json = await res.json()
      if (json.success) { toast.success("Anggota dinonaktifkan"); fetchMembers() }
      else toast.error(json.message ?? "Gagal menonaktifkan anggota")
    } catch {
      toast.error("Gagal menonaktifkan anggota")
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
      </div>
    )
  }

  if (!isMultimediaAdmin) return null

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text">
            Anggota Tim Multimedia
          </h1>
          <p className="text-muted-foreground">Kelola daftar personil dan peran spesialisasi mereka.</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 h-11 px-6 font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]" 
          onClick={openAdd}
        >
          <Plus className="mr-2 h-5 w-5" />
          Tambah Anggota
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border/40 bg-background/50 p-6 shadow-sm animate-pulse h-64"
            />
          ))}
        </div>
      ) : members.length === 0 ? (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-full bg-background flex items-center justify-center mb-6 ring-1 ring-border shadow-sm">
              <UsersIcon className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h3 className="text-xl font-bold">Belum ada anggota tim</h3>
            <p className="text-muted-foreground max-w-sm mt-2 mb-8 text-sm">
              Mulai membangun tim multimedia dengan menambahkan anggota dan menentukan peran mereka.
            </p>
            <Button onClick={openAdd} className="shadow-lg shadow-primary/10">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Anggota Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {members.map((m) => (
            <Card 
              key={m.id}
              className="group relative overflow-hidden border-border/50 bg-background/40 hover:bg-background transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
            >
              <CardHeader className="p-6 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <Avatar className="h-14 w-14 border-2 border-background shadow-sm group-hover:scale-105 transition-transform">
                    <AvatarFallback className="bg-primary/5 text-primary font-bold text-lg">
                      {m.nama.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full -mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => openEdit(m)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Profil
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openLinkUser(m)}>
                        <Link2 className="mr-2 h-4 w-4" />
                        Tautkan Akun
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => handleDeactivate(m)}>
                        <UserX className="mr-2 h-4 w-4" />
                        Nonaktifkan
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="pt-4 space-y-1">
                  <CardTitle className="text-base font-bold flex items-center gap-1.5 truncate">
                    {m.nama}
                    {m.userId && (
                      <div title="Akun Terhubung">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      </div>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs truncate flex items-center gap-1.5">
                    {m.phone ? (
                      <span className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer" onClick={() => window.open(`https://wa.me/${m.phone?.replace(/\D/g, "")}`, "_blank")}>
                        <Phone className="h-3 w-3" />
                        {m.phone}
                      </span>
                    ) : (
                      <span className="opacity-50 italic">No phone available</span>
                    )}
                  </CardDescription>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 pt-0 space-y-4">
                <div className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Keahlian Role</p>
                  <div className="flex flex-wrap gap-1.5">
                    {m.serviceRoles.map(r => (
                      <Badge
                        key={r}
                        variant="outline"
                        className={cn("text-[9px] font-bold uppercase tracking-tighter px-2 py-0 border", ROLE_CLASS[r])}
                      >
                        {r}
                      </Badge>
                    ))}
                    {m.serviceRoles.length === 0 && (
                      <span className="text-[10px] italic text-muted-foreground">No roles assigned</span>
                    )}
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="p-0 border-t border-border/40 overflow-hidden">
                <Button 
                  variant="ghost" 
                  className="w-full h-10 rounded-none text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all"
                  onClick={() => openEdit(m)}
                >
                  Lihat Riwayat Tugas
                </Button>
              </CardFooter>
              
              {/* Decorative background element */}
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{editingMember ? "Edit Anggota" : "Tambah Anggota"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama">Nama</Label>
              <Input
                id="nama"
                value={form.nama}
                onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                placeholder="Nama lengkap"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">No. HP / WhatsApp <span className="text-muted-foreground text-xs">(opsional)</span></Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="628123456789"
              />
            </div>
            <div className="space-y-2">
              <Label>Role / Kemampuan</Label>
              <div className="space-y-2">
                {ALL_ROLES.map(role => (
                  <label key={role} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.serviceRoles.includes(role)}
                      onChange={() => toggleRole(role)}
                      className="rounded"
                    />
                    <span className={cn("text-xs rounded px-1.5 py-0.5 font-mono", ROLE_CLASS[role])}>{role}</span>
                    <span className="text-sm">{ROLE_LABELS[role]}</span>
                  </label>
                ))}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingMember ? "Simpan" : "Tambah"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Link User Account Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Tautkan Akun Pengguna</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleLinkUser} className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tautkan akun pengguna ke anggota <strong>{linkingMember?.nama}</strong> agar mereka dapat login dan mengisi ketersediaan.
            </p>
            <div className="space-y-2">
              <Label htmlFor="linkUserId">User ID</Label>
              <Input
                id="linkUserId"
                value={linkUserId}
                onChange={e => setLinkUserId(e.target.value)}
                placeholder="ID pengguna dari halaman Users"
              />
              <p className="text-xs text-muted-foreground">
                Kosongkan untuk melepas tautan akun yang ada.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setLinkDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={linkSaving}>
                {linkSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
