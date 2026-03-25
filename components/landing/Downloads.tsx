"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, FileText, ArrowRight, BookOpen, Newspaper } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import Link from "next/link";
import { PdfPreviewModal } from "./PdfPreviewModal";

interface UnduhanItem {
  id: string
  judul: string
  tipe: string
  tanggal: string | Date
  fileUrl?: string
  url?: string
}

interface DownloadsProps {
  unduhan?: UnduhanItem[]
}

export function Downloads({ unduhan = [] }: DownloadsProps) {
  const shouldReduceMotion = useReducedMotion();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");

  const data = unduhan;

  const latestTataIbadah = data.find((u) => u.tipe === "TAIB" || u.tipe === "tata-ibadah")
  const latestWartaJemaat = data.find((u) => u.tipe === "WARTA" || u.tipe === "warta")

  const formatDate = (dateStr: string | Date) => {
    const date = typeof dateStr === "string" ? new Date(dateStr) : dateStr;
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <section id="downloads" className="w-full py-20 lg:py-32 bg-off-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-12">
          <AnimatedSection className="lg:col-span-8 lg:col-start-3 text-center space-y-6">
            <Badge
              variant="default"
              className="bg-navy text-white hover:bg-navy px-4 py-1.5 text-xs font-medium rounded-full inline-flex items-center"
            >
              <span className="font-mono mr-2">03</span>
              Unduhan
            </Badge>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-navy leading-tight">
              Dokumen & <span className="text-gold">Materi</span> Pelayanan
            </h2>

            <p className="text-gray-text text-base leading-relaxed max-w-2xl mx-auto">
              Akses tata ibadah, warta jemaat, dan dokumen pelayanan lainnya
              untuk mendukung perjalanan iman Anda.
            </p>
          </AnimatedSection>
        </div>

        <AnimatedSection delay={0.15}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {/* Tata Ibadah Card */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.4 }}
              className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-line/50 flex flex-col h-full"
            >
              <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-serif text-2xl text-navy font-medium mb-2">Tata Ibadah</h3>
              <p className="text-gray-text text-sm mb-6">
                Panduan liturgi untuk ibadah Minggu dan hari raya gerejawi.
              </p>

              {latestTataIbadah && (
                <div className="bg-off-white rounded-2xl p-4 mb-8 border border-gray-line/50">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-text mb-1">Terbaru • {formatDate(latestTataIbadah.tanggal)}</p>
                      <p className="font-medium text-navy text-sm line-clamp-2">{latestTataIbadah.judul}</p>
                      <button
                        onClick={() => { setPreviewUrl(latestTataIbadah.fileUrl ?? latestTataIbadah.url ?? ""); setPreviewTitle(latestTataIbadah.judul) }}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs text-navy font-medium hover:text-gold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Pratinjau
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-auto pt-4">
                <Link href="/unduhan" className="w-full block">
                  <Button variant="outline" className="w-full rounded-full border-gray-line hover:border-navy hover:bg-navy hover:text-white transition-colors group">
                    Lihat Semua Dokumen
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Warta Jemaat Card */}
            <motion.div
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.4, delay: shouldReduceMotion ? 0 : 0.1 }}
              className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-line/50 flex flex-col h-full"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center mb-6">
                <Newspaper className="w-6 h-6 text-blue-500" />
              </div>
              <h3 className="font-serif text-2xl text-navy font-medium mb-2">Warta Jemaat</h3>
              <p className="text-gray-text text-sm mb-6">
                Informasi terkini seputar pelayanan, kegiatan, dan berita duka/sukacita.
              </p>

              {latestWartaJemaat && (
                <div className="bg-off-white rounded-2xl p-4 mb-8 border border-gray-line/50">
                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-gray-text mb-1">Terbaru • {formatDate(latestWartaJemaat.tanggal)}</p>
                      <p className="font-medium text-navy text-sm line-clamp-2">{latestWartaJemaat.judul}</p>
                      <button
                        onClick={() => { setPreviewUrl(latestWartaJemaat.fileUrl ?? latestWartaJemaat.url ?? ""); setPreviewTitle(latestWartaJemaat.judul) }}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs text-navy font-medium hover:text-gold transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Pratinjau
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-auto pt-4">
                <Link href="/unduhan" className="w-full block">
                  <Button variant="outline" className="w-full rounded-full border-gray-line hover:border-navy hover:bg-navy hover:text-white transition-colors group">
                    Lihat Semua Dokumen
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </AnimatedSection>
      </div>

      <PdfPreviewModal
        isOpen={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        fileUrl={previewUrl ?? ""}
        title={previewTitle}
      />
    </section>
  );
}
