"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ImageIcon } from "lucide-react"
import { kegiatan } from "@/lib/data"
import { AnimatedSection } from "./AnimatedSection"

export function Activities() {
  const shouldReduceMotion = useReducedMotion()

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const getCategoryColor = (kategori: string) => {
    switch (kategori) {
      case "Ibadah":
        return "bg-navy text-white"
      case "Sosial":
        return "bg-green-600 text-white"
      case "Pelkat":
        return "bg-gold text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  return (
    <section id="activities" className="w-full py-20 lg:py-32 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Header row */}
        <AnimatedSection className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div className="space-y-4">
            {/* Section pill */}
            <Badge
              variant="default"
              className="bg-navy text-white hover:bg-navy px-4 py-1.5 text-xs font-medium rounded-full"
            >
              <span className="font-mono mr-2">04</span>
              Kegiatan
            </Badge>

            {/* Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-navy leading-tight">
              Kegiatan & <span className="text-gold">Acara</span>
            </h2>
          </div>

          <a
            href="#"
            className="inline-flex items-center gap-2 text-navy font-medium hover:text-gold transition-colors group text-sm"
          >
            Lihat Semua
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </AnimatedSection>

        {/* Card grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kegiatan.map((item, index) => {
            const isFeatured = index === 0

            return (
              <motion.div
                key={item.id}
                className={`group rounded-3xl overflow-hidden bg-white border border-gray-line ${
                  isFeatured ? "md:col-span-2 lg:col-span-2" : ""
                }`}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.5,
                  delay: shouldReduceMotion ? 0 : index * 0.1,
                  ease: "easeOut",
                }}
                whileHover={{
                  y: shouldReduceMotion ? 0 : -4,
                  boxShadow: "0 20px 40px rgba(0,0,0,0.12)",
                }}
              >
                {/* Image placeholder */}
                <div
                  className={`relative bg-gradient-to-br from-navy/10 to-navy/5 flex items-center justify-center ${
                    isFeatured ? "aspect-[16/9]" : "aspect-video"
                  }`}
                >
                  <ImageIcon className="w-12 h-12 text-navy/20" />

                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <Badge
                      className={`${getCategoryColor(item.kategori)} text-xs rounded-full`}
                    >
                      {item.kategori}
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <p className="text-xs text-gray-text mb-2">
                    {formatDate(item.tanggal)}
                  </p>
                  <h3 className="font-serif text-lg lg:text-xl font-medium text-navy mb-2 group-hover:text-gold transition-colors">
                    {item.judul}
                  </h3>
                  <p className="text-gray-text text-sm line-clamp-2">
                    {item.deskripsi}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
