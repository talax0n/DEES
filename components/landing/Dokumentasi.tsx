"use client"

import Link from "next/link"
import { motion, useReducedMotion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, Camera } from "lucide-react"
import { dokumentasi } from "@/lib/data"
import { AnimatedSection } from "./AnimatedSection"

export function Dokumentasi() {
  const shouldReduceMotion = useReducedMotion()

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const displayed = dokumentasi.slice(0, 6)

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
          {displayed.map((item, index) => (
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
                  <Camera className="w-10 h-10 text-navy/20 transition-transform duration-500 group-hover:scale-110" />
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
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
