"use client"

import { Star, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface Photo {
  id: string
  imageUrl: string
  caption?: string | null
  order: number
}

interface PhotoGridProps {
  photos: Photo[]
  coverPhotoId?: string | null
  onDelete: (photoId: string) => void
  onSetCover: (photoId: string) => void
}

export function PhotoGrid({ photos, coverPhotoId, onDelete, onSetCover }: PhotoGridProps) {
  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-line py-12 text-center text-muted-foreground">
        <p className="text-sm font-medium">Belum ada foto.</p>
        <p className="text-xs mt-1">Upload foto pertama untuk event ini.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {photos.map((photo) => {
        const isCover = photo.id === coverPhotoId
        return (
          <div
            key={photo.id}
            className={cn(
              "group relative aspect-square rounded-lg overflow-hidden border-2 transition-colors",
              isCover ? "border-gold" : "border-transparent"
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.imageUrl}
              alt={photo.caption ?? ""}
              className="w-full h-full object-cover"
            />

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                title="Set as cover"
                onClick={() => onSetCover(photo.id)}
                className={cn(
                  "rounded-full p-1.5 transition-colors",
                  isCover
                    ? "bg-gold text-white"
                    : "bg-white/20 text-white hover:bg-gold"
                )}
              >
                <Star className="w-4 h-4" />
              </button>
              <button
                type="button"
                title="Hapus foto"
                onClick={() => onDelete(photo.id)}
                className="rounded-full p-1.5 bg-white/20 text-white hover:bg-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Cover badge */}
            {isCover && (
              <div className="absolute top-2 left-2">
                <span className="bg-gold text-white text-xs font-medium px-2 py-0.5 rounded-full">
                  Cover
                </span>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
