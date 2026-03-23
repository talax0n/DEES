"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { PageHeader } from "@/components/admin/PageHeader"
import { DeleteDialog } from "@/components/admin/DeleteDialog"
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
import { Camera, Trash2 } from "lucide-react"

type EventSummary = {
  id: string
  namaAcara: string
  tanggal: string
  coverPhoto: string | null
  totalFoto: number
}

export default function AdminDokumentasiPage() {
  const router = useRouter()
  const [data, setData] = useState<EventSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ namaAcara: "", tanggal: "" })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch("/api/dokumentasi")
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch {
      toast.error("Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  function openDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setDeleteId(id)
    setDeleteOpen(true)
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/dokumentasi/${deleteId}`, { method: "DELETE" })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      toast.success(json.message)
      setDeleteOpen(false)
      setDeleteId(null)
      fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus event")
    } finally {
      setDeleting(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.namaAcara || !form.tanggal) return
    setSaving(true)
    try {
      const res = await fetch("/api/dokumentasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ namaAcara: form.namaAcara, tanggal: form.tanggal }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      toast.success(json.message)
      setForm({ namaAcara: "", tanggal: "" })
      setCreateOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal membuat event")
    } finally {
      setSaving(false)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dokumentasi Kegiatan"
        description="Kelola album foto kegiatan dan acara gereja"
        action={
          <Button
            className="bg-navy text-white hover:bg-navy/90"
            onClick={() => {
              setForm({ namaAcara: "", tanggal: "" })
              setCreateOpen(true)
            }}
          >
            + Buat Event
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-line bg-white overflow-hidden">
              <div className="aspect-[4/3] bg-muted animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-line py-16 text-center">
          <Camera className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Belum ada event.</p>
          <p className="text-xs text-muted-foreground mt-1">Buat event pertama untuk mulai upload foto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl overflow-hidden border border-gray-line bg-white cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/admin/dokumentasi/${item.id}`)}
            >
              <div className="aspect-[4/3] bg-gradient-to-br from-navy/10 to-navy/5 flex items-center justify-center relative overflow-hidden">
                {item.coverPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.coverPhoto} alt={item.namaAcara} className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-navy/20" />
                )}
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full px-2 py-0.5">
                    <Camera className="w-3 h-3" />
                    {item.totalFoto}
                  </span>
                </div>
                <button
                  type="button"
                  className="absolute top-2 left-2 rounded-full p-1.5 bg-destructive text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => openDelete(item.id, e)}
                  title="Hapus event"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-3">
                <p className="text-sm font-semibold text-navy line-clamp-1">{item.namaAcara}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDate(item.tanggal)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Buat Event Baru</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="namaAcara">Nama Acara</Label>
              <Input
                id="namaAcara"
                value={form.namaAcara}
                onChange={(e) => setForm((f) => ({ ...f, namaAcara: e.target.value }))}
                placeholder="Ibadah Natal 2026"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))}
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} disabled={saving}>
                Batal
              </Button>
              <Button type="submit" className="bg-navy text-white hover:bg-navy/90" disabled={saving}>
                {saving ? "Membuat..." : "Buat Event"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Hapus Event?"
        description="Event ini akan dihapus permanen beserta semua foto di dalamnya. Tindakan ini tidak dapat dibatalkan."
        loading={deleting}
      />
    </div>
  )
}
