import type { Metadata } from "next"
import { Camera } from "lucide-react"
import { dokumentasi } from "@/lib/data"

export const metadata: Metadata = {
  title: "Dokumentasi Kegiatan — GPIB Damai Sejahtera",
  description:
    "Dokumentasi foto kegiatan dan acara GPIB Damai Sejahtera. Temukan kenangan dari berbagai momen pelayanan kami.",
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default function DokumentasiPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-16">
        <div className="mb-10">
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-navy">
            Dokumentasi <span className="text-gold">Kegiatan</span>
          </h1>
          <p className="text-gray-text mt-3 text-base max-w-xl">
            Kumpulan foto dari berbagai kegiatan dan acara pelayanan gereja.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {dokumentasi.map((item) => (
            <div
              key={item.id}
              className="group rounded-2xl overflow-hidden bg-white border border-gray-line cursor-pointer hover:-translate-y-1 transition-transform duration-200"
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

              {/* Empty photos placeholder */}
              {item.photos.length === 0 && (
                <div className="px-4 py-3 border-t border-gray-line">
                  <p className="text-xs text-gray-text">Foto belum tersedia</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
