"use client"

import { useEffect, useRef, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { unduhanSchema } from "@/lib/validations"

type UnduhanInput = z.input<typeof unduhanSchema>
type UnduhanOutput = z.output<typeof unduhanSchema>
import { useAuth } from "@/components/providers/AuthProvider"
import { PageHeader } from "@/components/admin/PageHeader"
import { DeleteDialog } from "@/components/admin/DeleteDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, Search, MoreHorizontal } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  judul: string
  tipe: string
  tanggal: string
  fileUrl: string
  fileSize: number | null
}

export default function AdminUnduhanPage() {
  const { canDeleteCms: canDelete } = useAuth()
  const [data, setData] = useState<Unduhan[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("semua")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [search, setSearch] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UnduhanInput, unknown, UnduhanOutput>({
    resolver: zodResolver(unduhanSchema),
    defaultValues: { tipe: "TAIB" },
  })

  const tipe = watch("tipe")

  async function fetchData() {
    setLoading(true)
    try {
      const res = await fetch("/api/unduhan")
      const json = await res.json()
      if (json.success) setData(json.data)
    } catch {
      toast.error("Gagal memuat data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const filtered = data.filter((item) => {
    if (activeTab === "semua") return true
    if (activeTab === "taib") return item.tipe === "TAIB"
    if (activeTab === "warta") return item.tipe === "WARTA"
    return true
  })

  function openDelete(id: string) {
    setDeleteId(id)
    setDeleteOpen(true)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setSelectedFile(file)
  }

  const onSubmit = async (values: UnduhanOutput) => {
    if (!selectedFile) {
      toast.error("Pilih file PDF terlebih dahulu")
      return
    }
    setSaving(true)
    try {
      // 1. Upload file
      const uploadForm = new FormData()
      uploadForm.append("file", selectedFile)
      uploadForm.append("bucket", "documents")
      const uploadRes = await fetch("/api/upload", { method: "POST", body: uploadForm })
      const uploadJson = await uploadRes.json()
      if (!uploadJson.success) throw new Error(uploadJson.message)

      // 2. Save record
      const res = await fetch("/api/unduhan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          judul: values.judul,
          tipe: values.tipe,
          tanggal: values.tanggal,
          fileUrl: uploadJson.url,
          fileSize: uploadJson.size,
        }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      toast.success(json.message)
      setUploadOpen(false)
      setSelectedFile(null)
      reset({ tipe: "TAIB" })
      fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengupload file")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/unduhan/${deleteId}`, { method: "DELETE" })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      toast.success(json.message)
      setDeleteOpen(false)
      setDeleteId(null)
      fetchData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus unduhan")
    } finally {
      setDeleting(false)
    }
  }

  function formatTanggal(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Unduhan"
        description="Kelola file Tata Ibadah dan Warta Jemaat"
        action={
          <Button
            className="bg-navy text-white hover:bg-navy/90"
            onClick={() => {
              reset({ tipe: "TAIB" })
              setSelectedFile(null)
              setUploadOpen(true)
            }}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload File
          </Button>
        }
      />

      <div className="flex items-center gap-3 flex-wrap">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="semua">Semua ({data.length})</TabsTrigger>
            <TabsTrigger value="taib">Tata Ibadah ({data.filter((u) => u.tipe === "TAIB").length})</TabsTrigger>
            <TabsTrigger value="warta">Warta Jemaat ({data.filter((u) => u.tipe === "WARTA").length})</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari file..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="bg-background rounded-lg border border-border/40 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Judul</TableHead>
              <TableHead>Tipe</TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead className="w-12 text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <TableCell key={j}>
                      <div className="h-4 w-full rounded bg-muted animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.filter((item) => item.judul.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Tidak ada file ditemukan.
                </TableCell>
              </TableRow>
            ) : (
              filtered
                .filter((item) => item.judul.toLowerCase().includes(search.toLowerCase()))
                .map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-foreground">{item.judul}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                        item.tipe === "TAIB" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" : "bg-purple-500/10 text-purple-500 border-purple-500/20"
                      }`}>
                        {item.tipe === "TAIB" ? "Tata Ibadah" : "Warta"}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatTanggal(item.tanggal)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Aksi</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer">
                              Unduh
                            </a>
                          </DropdownMenuItem>
                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => openDelete(item.id)}
                              >
                                Hapus
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="judul">Judul</Label>
              <Input id="judul" {...register("judul")} placeholder="Tata Ibadah Minggu..." />
              {errors.judul && <p className="text-xs text-red-500">{errors.judul.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Tipe</Label>
              <Select value={tipe} onValueChange={(v) => setValue("tipe", v as "TAIB" | "WARTA")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TAIB">Tata Ibadah</SelectItem>
                  <SelectItem value="WARTA">Warta Jemaat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanggal">Tanggal</Label>
              <Input id="tanggal" type="date" {...register("tanggal")} />
              {errors.tanggal && <p className="text-xs text-red-500">{errors.tanggal.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>File PDF</Label>
              <div
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-line p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-7 w-7 text-muted-foreground mb-2" />
                {selectedFile ? (
                  <p className="text-sm font-medium text-navy">{selectedFile.name}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">Klik untuk memilih file PDF (maks. 10MB)</p>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setUploadOpen(false)} disabled={saving}>
                Batal
              </Button>
              <Button type="submit" className="bg-navy text-white hover:bg-navy/90" disabled={saving}>
                {saving ? "Mengupload..." : "Upload"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Hapus File?"
        description="File ini akan dihapus permanen dari sistem. Tindakan ini tidak dapat dibatalkan."
        loading={deleting}
      />
    </div>
  )
}
