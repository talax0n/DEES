"use client"

import { use, useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { kegiatan } from "@/lib/data"
import { DeleteDialog } from "@/components/admin/DeleteDialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowLeft, ImagePlus, Trash2 } from "lucide-react"
import Link from "next/link"

type FormState = {
  judul: string
  slug: string
  kategori: string
  tanggal: string
  deskripsi: string
  published: boolean
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .trim()
}

export default function EditKegiatanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const isNew = id === "new"

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [form, setForm] = useState<FormState>({
    judul: "",
    slug: "",
    kategori: "Ibadah",
    tanggal: "",
    deskripsi: "",
    published: false,
  })

  // Pre-fill form when editing an existing kegiatan
  useEffect(() => {
    if (!isNew) {
      const existing = kegiatan.find((k) => k.id === id)
      if (existing) {
        setForm({
          judul: existing.judul,
          slug: existing.slug,
          kategori: existing.kategori,
          tanggal: existing.tanggal,
          deskripsi: existing.deskripsi,
          published: existing.featured,
        })
      }
    }
  }, [id, isNew])

  function handleJudulChange(value: string) {
    setForm((f) => ({
      ...f,
      judul: value,
      // Auto-generate slug only if user hasn't manually edited it
      slug: slugify(value),
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isNew) {
      // TODO: Call POST /api/kegiatan with form data
      console.log("Create kegiatan:", form)
    } else {
      // TODO: Call PATCH /api/kegiatan/:id with form data
      console.log("Update kegiatan:", { id, ...form })
    }
    router.push("/admin/kegiatan")
  }

  function handleDelete() {
    // TODO: Call DELETE /api/kegiatan/:id
    console.log("Delete kegiatan:", id)
    router.push("/admin/kegiatan")
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/kegiatan">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold">
              {isNew ? "Buat Kegiatan Baru" : "Edit Kegiatan"}
            </h1>
            {!isNew && <p className="text-xs text-muted-foreground">ID: {id}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <Button
              variant="outline"
              className="text-destructive border-destructive hover:bg-destructive hover:text-white"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </Button>
          )}
          <Button
            form="kegiatan-form"
            type="submit"
            className="bg-navy text-white hover:bg-navy/90"
          >
            Simpan
          </Button>
        </div>
      </div>

      <form id="kegiatan-form" onSubmit={handleSubmit} className="space-y-5">
        {/* Judul */}
        <div className="space-y-2">
          <Label htmlFor="judul">Judul</Label>
          <Input
            id="judul"
            value={form.judul}
            onChange={(e) => handleJudulChange(e.target.value)}
            placeholder="Judul kegiatan"
            required
          />
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input
            id="slug"
            value={form.slug}
            onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
            placeholder="judul-kegiatan"
          />
          <p className="text-xs text-muted-foreground">
            Auto-generated dari judul. Gunakan huruf kecil dan tanda hubung saja.
          </p>
        </div>

        {/* Kategori + Tanggal in a row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="kategori">Kategori</Label>
            <Select
              value={form.kategori}
              onValueChange={(v) => setForm((f) => ({ ...f, kategori: v }))}
            >
              <SelectTrigger id="kategori">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ibadah">Ibadah</SelectItem>
                <SelectItem value="Sosial">Sosial</SelectItem>
                <SelectItem value="Pelkat">Pelkat</SelectItem>
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
              required
            />
          </div>
        </div>

        {/* Deskripsi */}
        <div className="space-y-2">
          <Label htmlFor="deskripsi">Deskripsi</Label>
          <Textarea
            id="deskripsi"
            value={form.deskripsi}
            onChange={(e) => setForm((f) => ({ ...f, deskripsi: e.target.value }))}
            placeholder="Deskripsi kegiatan..."
            rows={6}
          />
          {/* TODO: Replace with rich text editor (e.g. Tiptap) */}
        </div>

        {/* Cover Image */}
        <div className="space-y-2">
          <Label>Cover Image</Label>
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-line p-8 text-center">
            <ImagePlus className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              Klik untuk upload cover image
            </p>
            <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP (maks. 5MB)</p>
            {/* TODO: Connect to Supabase Storage upload */}
          </div>
        </div>

        {/* Galeri Foto */}
        <div className="space-y-2">
          <Label>Galeri Foto</Label>
          {/* Placeholder multi-image grid */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-lg border-2 border-dashed border-gray-line flex flex-col items-center justify-center text-muted-foreground"
              >
                <ImagePlus className="h-5 w-5 mb-1" />
                <span className="text-xs">Tambah</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {/* TODO: Multi-image upload to Supabase Storage */}
            Upload beberapa foto untuk galeri kegiatan.
          </p>
        </div>

        {/* Published toggle */}
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">Publikasikan</p>
            <p className="text-xs text-muted-foreground">
              Kegiatan akan tampil di halaman publik
            </p>
          </div>
          <Switch
            checked={form.published}
            onCheckedChange={(v) => setForm((f) => ({ ...f, published: v }))}
          />
        </div>
      </form>

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Hapus Kegiatan?"
        description="Kegiatan ini akan dihapus permanen beserta semua foto dan data terkait. Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  )
}
