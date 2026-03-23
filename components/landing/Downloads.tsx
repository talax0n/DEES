"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileText, Download, ArrowUpRight } from "lucide-react";
import { unduhan } from "@/lib/data";
import { AnimatedSection } from "./AnimatedSection";

export function Downloads() {
  const [activeTab, setActiveTab] = useState<"tata-ibadah" | "warta-jemaat">("tata-ibadah");
  const shouldReduceMotion = useReducedMotion();

  const tataIbadah = unduhan
    .filter((u) => u.tipe === "tata-ibadah")
    .slice(0, 4);
  const wartaJemaat = unduhan.filter((u) => u.tipe === "warta").slice(0, 4);

  const activeItems = activeTab === "tata-ibadah" ? tataIbadah : wartaJemaat;
  const iconColor = activeTab === "tata-ibadah" ? "text-red-500" : "text-blue-500";
  const iconBg = activeTab === "tata-ibadah" ? "bg-red-50" : "bg-blue-50";

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <section id="downloads" className="w-full py-20 lg:py-32 bg-off-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left column */}
          <AnimatedSection className="lg:col-span-4 space-y-6">
            {/* Section pill */}
            <Badge
              variant="default"
              className="bg-navy text-white hover:bg-navy px-4 py-1.5 text-xs font-medium rounded-full"
            >
              <span className="font-mono mr-2">03</span>
              Unduhan
            </Badge>

            {/* Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-navy leading-tight">
              Dokumen & <span className="text-gold">Materi</span>
              <br />
              Pelayanan
            </h2>

            {/* Description */}
            <p className="text-gray-text text-base leading-relaxed">
              Akses tata ibadah, warta jemaat, dan dokumen pelayanan lainnya
              untuk mendukung perjalanan iman Anda.
            </p>
          </AnimatedSection>

          {/* Right column - Tabs */}
          <AnimatedSection className="lg:col-span-8" delay={0.15}>
            <div className="w-full">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
              <TabsList className="bg-white border border-gray-line rounded-full p-1 mb-6">
                <TabsTrigger
                  value="tata-ibadah"
                  className="rounded-full px-6 py-2 data-[state=active]:bg-navy data-[state=active]:text-white"
                >
                  Tata Ibadah
                </TabsTrigger>
                <TabsTrigger
                  value="warta-jemaat"
                  className="rounded-full px-6 py-2 data-[state=active]:bg-navy data-[state=active]:text-white"
                >
                  Warta Jemaat
                </TabsTrigger>
              </TabsList>
              </Tabs>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -8 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.25, ease: "easeOut" }}
                  className="bg-white rounded-3xl shadow-sm overflow-hidden"
                >
                  {activeItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      className={`flex items-center justify-between p-4 lg:p-5 hover:bg-off-white transition-all group ${
                        index !== activeItems.length - 1
                          ? "border-b border-gray-line"
                          : ""
                      }`}
                      initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.3,
                        delay: shouldReduceMotion ? 0 : index * 0.07,
                        ease: "easeOut",
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
                          <FileText className={`w-5 h-5 ${iconColor}`} />
                        </div>
                        <div>
                          <p className="text-xs text-gray-text mb-0.5">
                            {formatDate(item.tanggal)}
                          </p>
                          <p className="font-medium text-navy text-sm lg:text-base">
                            {item.judul}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-gold hover:text-gold hover:bg-gold/10 flex items-center gap-1"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Unduh</span>
                      </Button>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* View all link */}
              <div className="mt-6 text-right">
                <a
                  href="#"
                  className="inline-flex items-center gap-2 text-navy font-medium hover:text-gold transition-colors group text-sm"
                >
                  Lihat Semua
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
