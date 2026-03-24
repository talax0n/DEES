"use client"

import { use, useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { DeleteDialog } from "@/components/admin/DeleteDialog"
import { useAuth } from "@/components/providers/AuthProvider"
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

interface EventDetail {
  id: string
  namaAcara: string
  tanggal: string
  coverPhoto: string | null
  photos: Photo[]
}

export default function DokumentasiEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const { role } = useAuth()
  const canDelete = role === "ADMIN"

  const [event, setEvent] = useState<EventDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [deletePhotoOpen, setDeletePhotoOpen] = useState(false)
  const [deleteEventOpen, setDeleteEventOpen] = useState(false)
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null)
  const [deletingPhoto, setDeletingPhoto] = useState(false)
  const [deletingEvent, setDeletingEvent] = useState(false)

  const fetchEvent = useCallback(async () => {
    try {
      const res = await fetch(`/api/dokumentasi/${id}`)
      const json = await res.json()
      if (json.success) setEvent(json.data)
      else toast.error(json.message ?? "Event tidak ditemukan")
    } catch {
      toast.error("Gagal memuat event")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchEvent() }, [fetchEvent])

  async function handleFilesSelected(files: File[]) {
    setUploading(true)
    try {
      const formData = new FormData()
      for (const file of files) formData.append("files", file)
      const res = await fetch(`/api/dokumentasi/${id}/photos`, {
        method: "POST",
        body: formData,
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      toast.success(json.message)
      fetchEvent()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengupload foto")
    } finally {
      setUploading(false)
    }
  }

  function openDeletePhoto(photoId: string) {
    setDeletingPhotoId(photoId)
    setDeletePhotoOpen(true)
  }

  async function handleDeletePhoto() {
    if (!deletingPhotoId) return
    setDeletingPhoto(true)
    try {
      const res = await fetch(`/api/dokumentasi/${id}/photos/${deletingPhotoId}`, { method: "DELETE" })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      toast.success(json.message)
      setDeletePhotoOpen(false)
      setDeletingPhotoId(null)
      fetchEvent()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus foto")
    } finally {
      setDeletingPhoto(false)
    }
  }

  async function handleSetCover(photoId: string) {
    try {
      const res = await fetch(`/api/dokumentasi/${id}/photos/${photoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setCover: true }),
      })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      toast.success("Cover foto berhasil diubah")
      fetchEvent()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal mengubah cover")
    }
  }

  async function handleDeleteEvent() {
    setDeletingEvent(true)
    try {
      const res = await fetch(`/api/dokumentasi/${id}`, { method: "DELETE" })
      const json = await res.json()
      if (!json.success) throw new Error(json.message)
      toast.success(json.message)
      router.push("/admin/dokumentasi")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Gagal menghapus event")
      setDeletingEvent(false)
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="max-w-3xl space-y-6">
        <div className="h-8 w-48 rounded bg-muted animate-pulse" />
        <div className="rounded-xl border-2 border-dashed border-gray-line p-10 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

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

  // Derive cover photo ID from the coverPhoto URL
  const coverPhotoId = event.coverPhoto
    ? (event.photos.find((p) => p.imageUrl === event.coverPhoto)?.id ?? null)
    : null

  return (
    <div className="max-w-3xl space-y-6">
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
        {canDelete && (
          <Button
            variant="outline"
            className="text-destructive border-destructive hover:bg-destructive hover:text-white"
            onClick={() => setDeleteEventOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Hapus Event
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {uploading && (
          <p className="text-sm text-muted-foreground animate-pulse">Mengupload foto...</p>
        )}
        <UploadZone onFilesSelected={handleFilesSelected} />
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-navy">{event.photos.length} foto</p>
      </div>

      <PhotoGrid
        photos={event.photos}
        coverPhotoId={coverPhotoId}
        onDelete={openDeletePhoto}
        onSetCover={handleSetCover}
        canDelete={canDelete}
      />

      <DeleteDialog
        open={deletePhotoOpen}
        onOpenChange={setDeletePhotoOpen}
        onConfirm={handleDeletePhoto}
        title="Hapus Foto?"
        description="Foto ini akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
        loading={deletingPhoto}
      />

      <DeleteDialog
        open={deleteEventOpen}
        onOpenChange={setDeleteEventOpen}
        onConfirm={handleDeleteEvent}
        title="Hapus Event?"
        description="Event ini akan dihapus permanen beserta semua foto di dalamnya. Tindakan ini tidak dapat dibatalkan."
        loading={deletingEvent}
      />
    </div>
  )
}
