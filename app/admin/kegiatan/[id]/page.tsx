"use client"

import { use, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function EditKegiatanPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)

  const [form, setForm] = useState({
    judul: "",
    slug: "",
    deskripsi: "",
    tanggal: "",
    lokasi: "",
    isPublished: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Submit to API /api/kegiatan with PATCH method
    console.log("Save kegiatan:", { id, ...form })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Edit Kegiatan</h1>
        <p className="text-muted-foreground text-sm">ID: {id}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="judul" className="text-sm font-medium">Judul</label>
          <Input id="judul" name="judul" value={form.judul} onChange={handleChange} placeholder="Judul kegiatan" />
        </div>

        <div className="space-y-2">
          <label htmlFor="slug" className="text-sm font-medium">Slug</label>
          <Input id="slug" name="slug" value={form.slug} onChange={handleChange} placeholder="judul-kegiatan" />
        </div>

        <div className="space-y-2">
          <label htmlFor="tanggal" className="text-sm font-medium">Tanggal</label>
          <Input id="tanggal" name="tanggal" type="date" value={form.tanggal} onChange={handleChange} />
        </div>

        <div className="space-y-2">
          <label htmlFor="lokasi" className="text-sm font-medium">Lokasi</label>
          <Input id="lokasi" name="lokasi" value={form.lokasi} onChange={handleChange} placeholder="Gedung Gereja" />
        </div>

        <div className="space-y-2">
          <label htmlFor="deskripsi" className="text-sm font-medium">Deskripsi</label>
          <Textarea
            id="deskripsi"
            name="deskripsi"
            value={form.deskripsi}
            onChange={handleChange}
            placeholder="Deskripsi kegiatan..."
            rows={6}
          />
          {/* TODO: Replace with rich text editor */}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Cover Image</p>
          {/* TODO: ImageUploader component */}
          <div className="rounded-lg border-2 border-dashed p-8 text-center text-sm text-muted-foreground">
            Upload cover image (TODO)
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">Galeri Foto</p>
          {/* TODO: Multi-image gallery uploader */}
          <div className="rounded-lg border-2 border-dashed p-8 text-center text-sm text-muted-foreground">
            Upload galeri foto (TODO)
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button type="submit">Simpan</Button>
          <Button type="button" variant="outline">Batal</Button>
        </div>
      </form>
    </div>
  )
}
