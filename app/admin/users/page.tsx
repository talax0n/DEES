"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/providers/AuthProvider"
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
import { Pencil, Plus, Loader2 } from "lucide-react"

type UserRole = "ADMIN" | "EDITOR" | "MULTIMEDIA_ADMIN" | "MULTIMEDIA_MEMBER"

type AdminUser = {
  id: string
  email: string
  name: string | null
  roles: UserRole[]
  createdAt: string
  multimediaMember?: { id: string; nama: string } | null
}

const ALL_ROLES: UserRole[] = ["ADMIN", "EDITOR", "MULTIMEDIA_ADMIN", "MULTIMEDIA_MEMBER"]

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  EDITOR: "Editor",
  MULTIMEDIA_ADMIN: "MM Admin",
  MULTIMEDIA_MEMBER: "MM Member",
}

const ROLE_COLORS: Record<UserRole, string> = {
  ADMIN: "bg-primary/20 text-primary",
  EDITOR: "bg-blue-100 text-blue-700",
  MULTIMEDIA_ADMIN: "bg-purple-100 text-purple-700",
  MULTIMEDIA_MEMBER: "bg-green-100 text-green-700",
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={cn(
      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
      ROLE_COLORS[role]
    )}>
      {ROLE_LABELS[role]}
    </span>
  )
}

function RoleCheckboxGroup({
  selected,
  onChange,
}: {
  selected: UserRole[]
  onChange: (roles: UserRole[]) => void
}) {
  function toggle(role: UserRole) {
    if (selected.includes(role)) {
      onChange(selected.filter((r) => r !== role))
    } else {
      onChange([...selected, role])
    }
  }
  return (
    <div className="grid grid-cols-2 gap-3">
      {ALL_ROLES.map((role) => (
        <div key={role} className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`role-${role}`}
            checked={selected.includes(role)}
            onChange={() => toggle(role)}
            className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
          />
          <Label htmlFor={`role-${role}`} className="text-sm cursor-pointer">
            {ROLE_LABELS[role]}
          </Label>
        </div>
      ))}
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border/40">
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-muted/60 rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  )
}

export default function UsersPage() {
  const router = useRouter()
  const { canDeleteCms, isLoading: authLoading } = useAuth()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({
    id: "",
    email: "",
    name: "",
    roles: [] as UserRole[],
  })
  const [createSubmitting, setCreateSubmitting] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Edit dialog
  const [editUser, setEditUser] = useState<AdminUser | null>(null)
  const [editRoles, setEditRoles] = useState<UserRole[]>([])
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && !canDeleteCms) {
      router.replace("/admin")
    }
  }, [authLoading, canDeleteCms, router])

  async function fetchUsers() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/admin/users")
      if (!res.ok) throw new Error("Gagal memuat data pengguna")
      const json = await res.json()
      setUsers(json.data)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && canDeleteCms) {
      fetchUsers()
    }
  }, [authLoading, canDeleteCms])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!createForm.id || !createForm.email || createForm.roles.length === 0) {
      setCreateError("Supabase User ID, email, dan minimal satu role wajib diisi")
      return
    }
    setCreateSubmitting(true)
    setCreateError(null)
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: createForm.id,
          email: createForm.email,
          name: createForm.name || undefined,
          roles: createForm.roles,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Gagal membuat pengguna")
      setCreateOpen(false)
      setCreateForm({ id: "", email: "", name: "", roles: [] })
      await fetchUsers()
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Terjadi kesalahan")
    } finally {
      setCreateSubmitting(false)
    }
  }

  function openEdit(user: AdminUser) {
    setEditUser(user)
    setEditRoles([...user.roles])
    setEditError(null)
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editUser) return
    if (editRoles.length === 0) {
      setEditError("Minimal satu role harus dipilih")
      return
    }
    setEditSubmitting(true)
    setEditError(null)
    try {
      const res = await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles: editRoles }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Gagal memperbarui pengguna")
      setEditUser(null)
      await fetchUsers()
    } catch (e) {
      setEditError(e instanceof Error ? e.message : "Terjadi kesalahan")
    } finally {
      setEditSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!canDeleteCms) return null

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengguna"
        description="Kelola akun pengguna dan hak akses sistem"
        action={
          <Button onClick={() => { setCreateOpen(true); setCreateError(null) }}>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Pengguna
          </Button>
        }
      />

      {error && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-border/40 bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/40 bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nama / Email</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Roles</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Anggota MM</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dibuat</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    Belum ada pengguna
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{u.name ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => (
                          <RoleBadge key={r} role={r} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {u.multimediaMember?.nama ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(u)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) setCreateError(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Pengguna</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label htmlFor="create-id">Supabase User ID *</Label>
              <Input
                id="create-id"
                placeholder="UUID dari Supabase dashboard"
                value={createForm.id}
                onChange={(e) => setCreateForm((f) => ({ ...f, id: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-email">Email *</Label>
              <Input
                id="create-email"
                type="email"
                placeholder="user@example.com"
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-name">Nama</Label>
              <Input
                id="create-name"
                placeholder="Nama lengkap (opsional)"
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Roles *</Label>
              <RoleCheckboxGroup
                selected={createForm.roles}
                onChange={(roles) => setCreateForm((f) => ({ ...f, roles }))}
              />
            </div>
            {createError && (
              <p className="text-sm text-destructive">{createError}</p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={createSubmitting}>
                {createSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editUser} onOpenChange={(open) => { if (!open) setEditUser(null) }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
          </DialogHeader>
          {editUser && (
            <form onSubmit={handleEdit} className="space-y-4 mt-2">
              <div className="rounded-lg bg-muted/30 px-3 py-2 text-sm">
                <p className="font-medium">{editUser.name ?? editUser.email}</p>
                <p className="text-xs text-muted-foreground">{editUser.email}</p>
              </div>
              <div className="space-y-2">
                <Label>Roles</Label>
                <RoleCheckboxGroup selected={editRoles} onChange={setEditRoles} />
              </div>
              {editError && (
                <p className="text-sm text-destructive">{editError}</p>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditUser(null)}>
                  Batal
                </Button>
                <Button type="submit" disabled={editSubmitting}>
                  {editSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
