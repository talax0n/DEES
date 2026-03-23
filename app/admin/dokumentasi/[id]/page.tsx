"use client"

import { use, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { dokumentasi } from "@/lib/data/dokumentasi"
import { DeleteDialog } from "@/components/admin/DeleteDialog"
import { UploadZone } from "@/components/admin/UploadZone"
import { PhotoGrid } from "@/components/admin/PhotoGrid"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Trash2 } from "lucide-react"

interface Photo {
  id: string
  imageUrl: string
  caption: string | null
  order: number
}

export default function DokumentasiEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()

  const event = dokumentasi.find((d) => d.id === id)

  const [photos, setPhotos] = useState<Photo[]>([])
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)

  if (!event) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Event tidak ditemukan.</p>
        <Link href="/admin/dokumentasi" className="text-navy text-sm underline mt-2 block">
          Kembali ke Dokumentasi
        </Link>
      </div>
    )
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  function handleFilesSelected(files: File[]) {
    // TODO: Upload files to Supabase Storage in Phase 3
    // For now, create local object URLs as preview
    const newPhotos: Photo[] = files.map((file, i) => ({
      id: `local-${Date.now()}-${i}`,
      imageUrl: URL.createObjectURL(file),
      caption: null,
      order: photos.length + i,
    }))
    setPhotos((prev) => [...prev, ...newPhotos])
  }

  function handleDeletePhoto(photoId: string) {
    // TODO: Call DELETE /api/dokumentasi/:id/photos/:photoId
    setPhotos((prev) => prev.filter((p) => p.id !== photoId))
    if (coverPhotoId === photoId) setCoverPhotoId(null)
  }

  function handleSetCover(photoId: string) {
    // TODO: Call PATCH /api/dokumentasi/:id/photos/:photoId (set cover)
    setCoverPhotoId(photoId)
  }

  function handleDeleteEvent() {
    // TODO: Call DELETE /api/dokumentasi/:id
    router.push("/admin/dokumentasi")
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/dokumentasi">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-bold text-navy">{event.namaAcara}</h1>
            <p className="text-xs text-muted-foreground">{formatDate(event.tanggal)}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="text-destructive border-destructive hover:bg-destructive hover:text-white"
          onClick={() => setDeleteOpen(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Hapus Event
        </Button>
      </div>

      {/* Upload zone */}
      <div className="space-y-2">
        <UploadZone onFilesSelected={handleFilesSelected} />
      </div>

      {/* Photo count */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-navy">{photos.length} foto</p>
      </div>

      {/* Photo grid */}
      <PhotoGrid
        photos={photos}
        coverPhotoId={coverPhotoId}
        onDelete={handleDeletePhoto}
        onSetCover={handleSetCover}
      />

      <DeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDeleteEvent}
        title="Hapus Event?"
        description="Event ini akan dihapus permanen beserta semua foto di dalamnya. Tindakan ini tidak dapat dibatalkan."
      />
    </div>
  )
}
