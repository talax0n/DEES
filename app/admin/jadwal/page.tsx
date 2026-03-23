"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { jadwalSchema } from "@/lib/validations"

type JadwalInput = z.input<typeof jadwalSchema>
type JadwalOutput = z.output<typeof jadwalSchema>
import { PageHeader } from "@/components/admin/PageHeader"
import { DeleteDialog } from "@/components/admin/DeleteDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

type Jadwal = {
  id: string
  namaIbadah: string
  hari: string
  waktu: string
  lokasi: string
  metode: string
  linkStreaming: string | null
  isActive: boolean
}

const METODE_LABEL: Record<string, string> = {
  offline: "Luring",
  online: "Daring",
  hybrid: "Hybrid",
}

export default function AdminJadwalPage() {
  const [data, setData] = useState<Jadwal[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<JadwalInput, unknown, JadwalOutput>({
    resolver: zodResolver(jadwalSchema),
    defaultValues: { metode: "offline", isActive: true, linkStreaming: "" },
  })

  const metode = watch("metode")
  const isActive = watch("isActive")

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch("/api/jadwal")
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch {
      toast.error("Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  function openAdd() {
    setEditingId(null)
    reset({ namaIbadah: "", hari: "", waktu: "", lokasi: "", metode: "offline", linkStreaming: "", isActive: true })
    setFormOpen(true)
  }

  function openEdit(jadwal: Jadwal) {
    setEditingId(jadwal.id)
    reset({
      namaIbadah: jadwal.namaIbadah,
      hari: jadwal.hari,
      waktu: jadwal.waktu,
      lokasi: jadwal.lokasi,
      metode: jadwal.metode as "offline" | "online" | "hybrid",
      linkStreaming: jadwal.linkStreaming ?? "",
      isActive: jadwal.isActive,
    })
    setFormOpen(true)
  }

  function openDelete(id: string) {
    setDeleteId(id)
    setDeleteOpen(true)
  }

  const onSubmit = async (values: JadwalOutput) => {
    setSaving(true)
    try {
      const url = editingId ? `/api/jadwal/${editingId}` : "/api/jadwal"
      const method = editingId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      toast.success(json.message)
      setFormOpen(false)
      fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menyimpan jadwal")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/jadwal/${deleteId}`, { method: "DELETE" })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      toast.success(json.message)
      setDeleteId(null)
      fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus jadwal")
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Jadwal Ibadah"
        description="Kelola jadwal ibadah jemaat"
        action={
          <Button className="bg-navy text-white hover:bg-navy/90" onClick={openAdd}>
            + Tambah Jadwal
          </Button>
        }
      />

      <div className="rounded-lg border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Nama Ibadah</TableHead>
              <TableHead>Hari / Waktu</TableHead>
              <TableHead>Lokasi</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-full rounded bg-muted animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Belum ada jadwal.
                </TableCell>
              </TableRow>
            ) : (
              data.map((jadwal) => (
                <TableRow key={jadwal.id}>
                  <TableCell className="font-medium">{jadwal.namaIbadah}</TableCell>
                  <TableCell>{jadwal.hari}, {jadwal.waktu}</TableCell>
                  <TableCell className="text-muted-foreground">{jadwal.lokasi}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      jadwal.metode === "online" ? "bg-blue-100 text-blue-700"
                        : jadwal.metode === "hybrid" ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-700"
                    }`}>
                      {METODE_LABEL[jadwal.metode] ?? jadwal.metode}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      jadwal.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {jadwal.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <button className="text-xs text-blue-600 hover:underline" onClick={() => openEdit(jadwal)}>
                        Edit
                      </button>
                      <button className="text-xs text-red-600 hover:underline" onClick={() => openDelete(jadwal.id)}>
                        Hapus
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Jadwal" : "Tambah Jadwal"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="namaIbadah">Nama Ibadah</Label>
              <Input id="namaIbadah" {...register("namaIbadah")} placeholder="Ibadah Minggu Pagi" />
              {errors.namaIbadah && <p className="text-xs text-red-500">{errors.namaIbadah.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="hari">Hari</Label>
                <Input id="hari" {...register("hari")} placeholder="Minggu" />
                {errors.hari && <p className="text-xs text-red-500">{errors.hari.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="waktu">Waktu</Label>
                <Input id="waktu" {...register("waktu")} placeholder="09.00 WIB" />
                {errors.waktu && <p className="text-xs text-red-500">{errors.waktu.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="lokasi">Lokasi</Label>
              <Input id="lokasi" {...register("lokasi")} placeholder="Gedung Utama" />
              {errors.lokasi && <p className="text-xs text-red-500">{errors.lokasi.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Metode</Label>
              <Select value={metode} onValueChange={(v) => setValue("metode", v as "offline" | "online" | "hybrid")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="offline">Luring</SelectItem>
                  <SelectItem value="online">Daring</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(metode === "online" || metode === "hybrid") && (
              <div className="space-y-2">
                <Label htmlFor="linkStreaming">Link Streaming (opsional)</Label>
                <Input id="linkStreaming" {...register("linkStreaming")} placeholder="https://youtube.com/..." />
                {errors.linkStreaming && <p className="text-xs text-red-500">{errors.linkStreaming.message}</p>}
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Aktif</Label>
              <Switch id="isActive" checked={isActive} onCheckedChange={(v) => setValue("isActive", v)} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Batal
              </Button>
              <Button type="submit" className="bg-navy text-white hover:bg-navy/90" disabled={saving}>
                {saving ? "Menyimpan..." : "Simpan"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Hapus Jadwal?"
        description="Jadwal ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
        loading={deleting}
      />
    </div>
  )
}
