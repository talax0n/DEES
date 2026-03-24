"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Camera } from "lucide-react";
import { PhotoLightbox } from "@/components/landing/PhotoLightbox";

interface Photo {
  id: string;
  imageUrl: string;
  caption: string | null;
}

interface EventItem {
  id: string;
  namaAcara: string;
  tanggal: string;
  coverPhoto: string | null;
  totalFoto: number;
  photos: Photo[];
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function DokumentasiClient({ events }: { events: EventItem[] }) {
  const [lightbox, setLightbox] = useState<{
    eventIndex: number;
    photoIndex: number;
  } | null>(null);

  function openLightbox(eventIndex: number) {
    setLightbox({ eventIndex, photoIndex: 0 });
  }

  function closeLightbox() {
    setLightbox(null);
  }

  const activeEvent = lightbox !== null ? events[lightbox.eventIndex] : null;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
      {/* Header */}
      <div className="mb-10">
        <Badge className="bg-navy text-white hover:bg-navy px-4 py-1.5 text-xs font-medium rounded-full mb-4">
          Dokumentasi
        </Badge>
        <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-navy">
          Dokumentasi <span className="text-gold">Kegiatan</span>
        </h1>
        <p className="text-gray-text mt-3 text-base max-w-xl">
          Kumpulan foto dari berbagai kegiatan dan acara pelayanan gereja.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-20 text-gray-text">
          <Camera className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Dokumentasi belum tersedia.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {events.map((item, eventIndex) => (
            <button
              key={item.id}
              onClick={() => openLightbox(eventIndex)}
              className="group rounded-2xl overflow-hidden bg-white border border-gray-line cursor-pointer hover:-translate-y-1 transition-transform duration-200 text-left w-full"
            >
              {/* Cover photo area */}
              <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-navy/15 to-navy/5 flex items-center justify-center">
                {item.coverPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.coverPhoto}
                    alt={item.namaAcara}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <Camera className="w-10 h-10 text-navy/20" />
                )}

                {/* Photo count badge */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center gap-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full px-2.5 py-1">
                    <Camera className="w-3 h-3" />
                    {item.totalFoto} foto
                  </span>
                </div>

                {/* Bottom overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-4">
                  <p className="text-white font-semibold text-sm leading-snug line-clamp-2">
                    {item.namaAcara}
                  </p>
                  <p className="text-white/70 text-xs mt-1">{formatDate(item.tanggal)}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox !== null && activeEvent && (
        <PhotoLightbox
          isOpen={lightbox !== null}
          onClose={closeLightbox}
          eventName={activeEvent.namaAcara}
          photos={activeEvent.photos}
          initialIndex={0}
          currentIndex={lightbox.photoIndex}
          onIndexChange={(i) => setLightbox((prev) => prev ? { ...prev, photoIndex: i } : null)}
        />
      )}
    </div>
  );
}
