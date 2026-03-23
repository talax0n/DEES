"use client"

import { useState } from "react"
import { unduhan } from "@/lib/data"
import { PageHeader } from "@/components/admin/PageHeader"
import { DeleteDialog } from "@/components/admin/DeleteDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload } from "lucide-react"
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

type Unduhan = {
  id: string
  tipe: "tata-ibadah" | "warta"
  tanggal: string
  judul: string
  url: string
}

type FormState = {
  judul: string
  tipe: "tata-ibadah" | "warta"
  tanggal: string
}

const emptyForm: FormState = {
  judul: "",
  tipe: "tata-ibadah",
  tanggal: "",
}

export default function AdminUnduhanPage() {
  const [data, setData] = useState<Unduhan[]>(unduhan)
  const [activeTab, setActiveTab] = useState("semua")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const filtered = data.filter((item) => {
    if (activeTab === "semua") return true
    if (activeTab === "taib") return item.tipe === "tata-ibadah"
    if (activeTab === "warta") return item.tipe === "warta"
    return true
  })

  function openDelete(id: string) {
    setDeleteId(id)
    setDeleteOpen(true)
  }

  function handleUpload() {
    // TODO: Upload file to Supabase Storage and save record to database
    const newItem: Unduhan = {
      id: String(Date.now()),
      judul: form.judul,
      tipe: form.tipe,
      tanggal: form.tanggal,
      url: "#",
    }
    setData((prev) => [newItem, ...prev])
    setForm(emptyForm)
    setUploadOpen(false)
  }

  function handleDelete() {
    if (!deleteId) return
    // TODO: Call DELETE /api/unduhan/:id and remove from Supabase Storage
    setData((prev) => prev.filter((u) => u.id !== deleteId))
    setDeleteId(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Unduhan"
        description="Kelola file Tata Ibadah dan Warta Jemaat"
        action={
          <Button className="bg-navy text-white hover:bg-navy/90" onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Button>
        }
      />

      {/* Filter tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="semua">Semua ({data.length})</TabsTrigger>
          <TabsTrigger value="taib">
            Tata Ibadah ({data.filter((u) => u.tipe === "tata-ibadah").length})
          </TabsTrigger>
          <TabsTrigger value="warta">
            Warta Jemaat ({data.filter((u) => u.tipe === "warta").length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-lg border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40">
              <TableHead>Judul</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="w-28">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.judul}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.tipe === "tata-ibadah"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {item.tipe === "tata-ibadah" ? "Tata Ibadah" : "Warta"}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{item.tanggal}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Unduh
                    </a>
                    <button
                      className="text-xs text-red-600 hover:underline"
                      onClick={() => openDelete(item.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Tidak ada file ditemukan.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="judul">Judul</Label>
              <Input
                id="judul"
                value={form.judul}
                onChange={(e) => setForm((f) => ({ ...f, judul: e.target.value }))}
                placeholder="Tata Ibadah Minggu..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipe">Tipe</Label>
              <Select
                value={form.tipe}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, tipe: v as "tata-ibadah" | "warta" }))
                }
              >
                <SelectTrigger id="tipe">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tata-ibadah">Tata Ibadah</SelectItem>
                  <SelectItem value="warta">Warta Jemaat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input
                id="tanggal"
                type="date"
                value={form.tanggal}
                onChange={(e) => setForm((f) => ({ ...f, tanggal: e.target.value }))}
              />
            </div>
            {/* File upload zone */}
            <div className="space-y-2">
              <Label>File</Label>
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-line p-8 text-center">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Klik untuk memilih file atau seret ke sini
                </p>
                <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX (maks. 10MB)</p>
                {/* TODO: Connect to Supabase Storage upload */}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)}>
              Batal
            </Button>
            <Button
              className="bg-navy text-white hover:bg-navy/90"
              onClick={handleUpload}
              disabled={!form.judul || !form.tanggal}
            >
              Upload
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Hapus File?"
        description="File ini akan dihapus permanen dari sistem. Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  )
}
