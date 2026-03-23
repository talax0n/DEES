"use client"

import { useState } from "react"
import { jadwalIbadah } from "@/lib/data"
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
  jenis: string
  waktu: string
  metode: "Luring" | "Daring" | "Luring & Live Streaming"
  highlight: boolean
  streamingUrl?: string
}

type FormState = {
  jenis: string
  waktu: string
  metode: "Luring" | "Daring" | "Luring & Live Streaming"
  streamingUrl: string
  active: boolean
}

const emptyForm: FormState = {
  jenis: "",
  waktu: "",
  metode: "Luring",
  streamingUrl: "",
  active: true,
}

export default function AdminJadwalPage() {
  const [data, setData] = useState<Jadwal[]>(jadwalIbadah)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  function openAdd() {
    setEditingId(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  function openEdit(jadwal: Jadwal) {
    setEditingId(jadwal.id)
    setForm({
      jenis: jadwal.jenis,
      waktu: jadwal.waktu,
      metode: jadwal.metode,
      streamingUrl: jadwal.streamingUrl ?? "",
      active: jadwal.highlight,
    })
    setFormOpen(true)
  }

  function openDelete(id: string) {
    setDeleteId(id)
    setDeleteOpen(true)
  }

  function handleSave() {
    if (editingId) {
      // TODO: Call PATCH /api/jadwal/:id
      setData((prev) =>
        prev.map((j) =>
          j.id === editingId
            ? { ...j, jenis: form.jenis, waktu: form.waktu, metode: form.metode, streamingUrl: form.streamingUrl || undefined, highlight: form.active }
            : j
        )
      )
    } else {
      // TODO: Call POST /api/jadwal
      const newItem: Jadwal = {
        id: String(Date.now()),
        jenis: form.jenis,
        waktu: form.waktu,
        metode: form.metode,
        streamingUrl: form.streamingUrl || undefined,
        highlight: form.active,
      }
      setData((prev) => [...prev, newItem])
    }
    setFormOpen(false)
  }

  function handleDelete() {
    if (!deleteId) return
    // TODO: Call DELETE /api/jadwal/:id
    setData((prev) => prev.filter((j) => j.id !== deleteId))
    setDeleteId(null)
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
              <TableHead>Jenis Ibadah</TableHead>
              <TableHead>Waktu</TableHead>
              <TableHead>Metode</TableHead>
              <TableHead>Streaming</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((jadwal) => (
              <TableRow key={jadwal.id}>
                <TableCell className="font-medium">{jadwal.jenis}</TableCell>
                <TableCell>{jadwal.waktu}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      jadwal.metode === "Daring"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {jadwal.metode}
                  </span>
                </TableCell>
                <TableCell>
                  {jadwal.streamingUrl ? (
                    <a
                      href={jadwal.streamingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline truncate max-w-[120px] block"
                    >
                      {jadwal.streamingUrl}
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                    Aktif
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <button
                      className="text-xs text-blue-600 hover:underline"
                      onClick={() => openEdit(jadwal)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-xs text-red-600 hover:underline"
                      onClick={() => openDelete(jadwal.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                  Belum ada jadwal.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Jadwal" : "Tambah Jadwal"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="jenis">Jenis Ibadah</Label>
              <Input
                id="jenis"
                value={form.jenis}
                onChange={(e) => setForm((f) => ({ ...f, jenis: e.target.value }))}
                placeholder="Ibadah Minggu I"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="waktu">Waktu</Label>
              <Input
                id="waktu"
                value={form.waktu}
                onChange={(e) => setForm((f) => ({ ...f, waktu: e.target.value }))}
                placeholder="09.00 WIB"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metode">Metode</Label>
              <Select
                value={form.metode}
                onValueChange={(v) => setForm((f) => ({ ...f, metode: v as "Luring" | "Daring" }))}
              >
                <SelectTrigger id="metode">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Luring">Luring</SelectItem>
                  <SelectItem value="Daring">Daring</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.metode === "Daring" && (
              <div className="space-y-2">
                <Label htmlFor="streamingUrl">URL Streaming (opsional)</Label>
                <Input
                  id="streamingUrl"
                  value={form.streamingUrl}
                  onChange={(e) => setForm((f) => ({ ...f, streamingUrl: e.target.value }))}
                  placeholder="https://youtube.com/..."
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Aktif</Label>
              <Switch
                id="active"
                checked={form.active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Batal
            </Button>
            <Button
              className="bg-navy text-white hover:bg-navy/90"
              onClick={handleSave}
              disabled={!form.jenis || !form.waktu}
            >
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Hapus Jadwal?"
        description="Jadwal ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  )
}
