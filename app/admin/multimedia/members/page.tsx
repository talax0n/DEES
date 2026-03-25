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
import { Loader2, Plus, Pencil, UserX, Link2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/AuthProvider"

type MultimediaRole = "SLD" | "SND" | "STR" | "CAM"

type Member = {
  id: string
  nama: string
  phone: string | null
  roles: MultimediaRole[]
  isActive: boolean
  userId: string | null
}

const ALL_ROLES: MultimediaRole[] = ["SLD", "SND", "STR", "CAM"]
const ROLE_LABELS: Record<MultimediaRole, string> = {
  SLD: "Operator Slide",
  SND: "Operator Sound",
  STR: "Streamer",
  CAM: "Cameraman",
}
const ROLE_CLASS: Record<MultimediaRole, string> = {
  SLD: "bg-slate-100 text-slate-700",
  SND: "bg-blue-100 text-blue-700",
  STR: "bg-red-100 text-red-700",
  CAM: "bg-green-100 text-green-700",
}

const defaultForm = { nama: "", phone: "", roles: [] as MultimediaRole[], userId: "" }

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
    setForm({ nama: member.nama, phone: member.phone ?? "", roles: [...member.roles], userId: member.userId ?? "" })
    setDialogOpen(true)
  }

  function openLinkUser(member: Member) {
    setLinkingMember(member)
    setLinkUserId(member.userId ?? "")
    setLinkDialogOpen(true)
  }

  function toggleRole(role: MultimediaRole) {
    setForm(f => ({
      ...f,
      roles: f.roles.includes(role) ? f.roles.filter(r => r !== role) : [...f.roles, role],
    }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (form.roles.length === 0) { toast.error("Pilih minimal 1 role"); return }

    setSaving(true)
    try {
      const body: Record<string, unknown> = {
        nama: form.nama,
        phone: form.phone || undefined,
        roles: form.roles,
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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!isMultimediaAdmin) return null

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <PageHeader
          title="Anggota Tim Multimedia"
          description="Kelola daftar anggota dan kemampuan role mereka"
        />
        <Button onClick={openAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Anggota
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : members.length === 0 ? (
        <div className="text-center py-16 border rounded-lg text-muted-foreground">
          <p>Belum ada anggota terdaftar.</p>
          <Button variant="outline" className="mt-4" onClick={openAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Anggota Pertama
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="text-left px-4 py-3 font-medium">Nama</th>
                <th className="text-left px-4 py-3 font-medium">No. HP</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Akun</th>
                <th className="px-4 py-3 w-28" />
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={m.id} className={cn("border-b last:border-0", i % 2 === 1 && "bg-muted/20")}>
                  <td className="px-4 py-3 font-medium">{m.nama}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {m.phone ? (
                      <a
                        href={`https://wa.me/${m.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline text-blue-600"
                      >
                        {m.phone}
                      </a>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {m.roles.map(r => (
                        <span
                          key={r}
                          title={ROLE_LABELS[r]}
                          className={cn("text-xs rounded px-1.5 py-0.5 font-mono", ROLE_CLASS[r])}
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {m.userId ? (
                      <span className="text-xs text-green-600 font-mono">Terhubung</span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Tautkan akun pengguna"
                        onClick={() => openLinkUser(m)}
                      >
                        <Link2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => openEdit(m)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeactivate(m)}
                      >
                        <UserX className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                      checked={form.roles.includes(role)}
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
