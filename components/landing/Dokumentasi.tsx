"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Camera } from "lucide-react"
import { AnimatedSection } from "./AnimatedSection"
import { PhotoLightbox } from "./PhotoLightbox"

interface DokumentasiPhoto {
  id: string
  imageUrl: string
  caption?: string | null
  order?: number
}

interface DokumentasiEventItem {
  id: string
  namaAcara: string
  tanggal: string | Date
  coverPhoto?: string | null
  totalFoto?: number
  photos?: DokumentasiPhoto[] | string[]
  _count?: { photos: number }
}

interface DokumentasiProps {
  events?: DokumentasiEventItem[]
}

function resolveItem(item: DokumentasiEventItem) {
  const coverPhoto = item.coverPhoto
    ?? (item.photos && item.photos.length > 0
      ? (typeof item.photos[0] === "string" ? item.photos[0] : (item.photos[0] as DokumentasiPhoto).imageUrl)
      : null)
  const totalFoto = item.totalFoto ?? item._count?.photos ?? 0
  return { coverPhoto, totalFoto }
}

function getEventPhotos(event: DokumentasiEventItem): { id: string; imageUrl: string; caption: string | null }[] {
  if (!event.photos || event.photos.length === 0) return []
  return event.photos.map((p, i) => {
    if (typeof p === 'string') return { id: String(i), imageUrl: p, caption: null }
    return {
      id: (p as { id: string; imageUrl: string; caption?: string | null }).id,
      imageUrl: (p as { id: string; imageUrl: string; caption?: string | null }).imageUrl,
      caption: (p as { id: string; imageUrl: string; caption?: string | null }).caption ?? null,
    }
  })
}

export function Dokumentasi({ events = [] }: DokumentasiProps) {
  const shouldReduceMotion = useReducedMotion()
  const [selectedEvent, setSelectedEvent] = useState<DokumentasiEventItem | null>(null)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const rawData = events
  const displayed = rawData.slice(0, 6)

  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  return (
    <section id="dokumentasi" className="w-full py-20 lg:py-32 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header row */}
        <AnimatedSection className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="space-y-4">
            <Badge
              variant="default"
              className="bg-navy text-white hover:bg-navy px-4 py-1.5 text-xs font-medium rounded-full"
            >
              <span className="font-mono mr-2">04</span>
              Dokumentasi
            </Badge>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-navy leading-tight">
              Dokumentasi <span className="text-gold">Kegiatan</span>
            </h2>
          </div>

          <Link
            href="/dokumentasi"
            className="inline-flex items-center gap-2 text-navy font-medium hover:text-gold transition-colors group text-sm"
          >
            Lihat Semua
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </AnimatedSection>

        {/* Card grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {displayed.map((item, index) => {
            const { coverPhoto, totalFoto } = resolveItem(item)
            return (
              <motion.div
                key={item.id}
                className="group rounded-2xl overflow-hidden bg-white border border-gray-line cursor-pointer"
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.5,
                  delay: shouldReduceMotion ? 0 : index * 0.08,
                  ease: "easeOut",
                }}
                whileHover={{
                  y: shouldReduceMotion ? 0 : -4,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                }}
                onClick={() => {
                  const photos = getEventPhotos(item)
                  if (photos.length > 0) {
                    setSelectedEvent(item)
                    setLightboxIndex(0)
                  }
                }}
              >
                {/* Cover photo area */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-navy/15 to-navy/5 flex items-center justify-center">
                  {coverPhoto ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={coverPhoto}
                      alt={item.namaAcara}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <Camera className="w-10 h-10 text-navy/20 transition-transform duration-500 group-hover:scale-110" />
                  )}

                  {/* Photo count badge */}
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full px-2.5 py-1">
                      <Camera className="w-3 h-3" />
                      {totalFoto} foto
                    </span>
                  </div>

                  {/* Hover overlay hint */}
                  {totalFoto > 0 && (
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="bg-white/90 rounded-full px-3 py-1.5 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-navy" />
                        <span className="text-navy text-xs font-medium">Lihat Foto</span>
                      </div>
                    </div>
                  )}

                  {/* Bottom overlay */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4">
                    <p className="text-white font-semibold text-sm leading-snug line-clamp-2">
                      {item.namaAcara}
                    </p>
                    <p className="text-white/70 text-xs mt-1">{formatDate(item.tanggal)}</p>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {selectedEvent && (
        <PhotoLightbox
          isOpen={!!selectedEvent}
          onClose={() => setSelectedEvent(null)}
          eventName={selectedEvent.namaAcara}
          photos={getEventPhotos(selectedEvent)}
          initialIndex={0}
          currentIndex={lightboxIndex}
          onIndexChange={setLightboxIndex}
        />
      )}
    </section>
  )
}
