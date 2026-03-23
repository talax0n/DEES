"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { dokumentasi, type DokumentasiEvent } from "@/lib/data/dokumentasi"
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

export default function AdminDokumentasiPage() {
  const router = useRouter()
  const [data, setData] = useState<DokumentasiEvent[]>(dokumentasi)
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ namaAcara: "", tanggal: "" })

  function openDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    setDeleteId(id)
    setDeleteOpen(true)
  }

  function handleDelete() {
    if (!deleteId) return
    // TODO: Call DELETE /api/dokumentasi/:id
    setData((prev) => prev.filter((d) => d.id !== deleteId))
    setDeleteId(null)
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.namaAcara || !form.tanggal) return
    // TODO: Call POST /api/dokumentasi with form data
    const newEvent: DokumentasiEvent = {
      id: String(Date.now()),
      namaAcara: form.namaAcara,
      tanggal: form.tanggal,
      coverPhoto: null,
      totalFoto: 0,
      photos: [],
    }
    setData((prev) => [newEvent, ...prev])
    setForm({ namaAcara: "", tanggal: "" })
    setCreateOpen(false)
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
            onClick={() => setCreateOpen(true)}
          >
            + Buat Event
          </Button>
        }
      />

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-line py-16 text-center">
          <Camera className="w-10 h-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            Belum ada event.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Buat event pertama untuk mulai upload foto.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-xl overflow-hidden border border-gray-line bg-white cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(`/admin/dokumentasi/${item.id}`)}
            >
              {/* Cover photo */}
              <div className="aspect-[4/3] bg-gradient-to-br from-navy/10 to-navy/5 flex items-center justify-center relative overflow-hidden">
                {item.coverPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.coverPhoto}
                    alt={item.namaAcara}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-navy/20" />
                )}

                {/* Photo count badge */}
                <div className="absolute top-2 right-2">
                  <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full px-2 py-0.5">
                    <Camera className="w-3 h-3" />
                    {item.totalFoto}
                  </span>
                </div>

                {/* Delete button */}
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

      {/* Create event dialog */}
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
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-navy text-white hover:bg-navy/90">
                Buat Event
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
      />
    </div>
  )
}
