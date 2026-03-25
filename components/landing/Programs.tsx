"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  Play,
  Users,
  Youtube,
} from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { Marquee } from "@/components/ui/marquee";
import Image from "next/image";
import { pelkat } from "@/lib/data/pelkat";
import { CHURCH_INFO } from "@/lib/constants";

const getYouTubeVideoId = (url: string | null | undefined) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

interface JadwalItem {
  id: string
  namaIbadah?: string
  jenis?: string
  waktu: string
  metode?: string
  linkStreaming?: string | null
  highlight?: boolean
}

interface ProgramsProps {
  jadwal?: JadwalItem[]
}

export function Programs({ jadwal = [] }: ProgramsProps) {
  const shouldReduceMotion = useReducedMotion();

  const liveStreamUrl = jadwal.find((j) => j.linkStreaming)?.linkStreaming;
  const videoId = getYouTubeVideoId(liveStreamUrl);

  return (
    <section id="programs" className="w-full py-20 lg:py-32 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* TOP HALF - Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Left - Large photo card */}
          <AnimatedSection>
            {videoId ? (
              <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-navy relative shadow-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full border-0"
                />
                <div className="absolute top-4 left-4 pointer-events-none">
                  <Badge className="bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm border-none">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Live Preview
                  </Badge>
                </div>
              </div>
            ) : (
              <a
                href={CHURCH_INFO.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-3xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-navy to-navy-mid relative transition-transform hover:scale-[1.02] shadow-lg"
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                  <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                    <Youtube className="w-10 h-10 text-red-500" />
                  </div>
                  <h3 className="text-2xl font-serif font-medium mb-3">Kanal YouTube Kami</h3>
                  <p className="text-white/80 max-w-sm text-sm leading-relaxed">
                    Ikuti ibadah secara live streaming dan tonton kembali rekaman ibadah sebelumnya.
                  </p>
                </div>
              </a>
            )}
          </AnimatedSection>

          {/* Right - Content */}
          <AnimatedSection className="space-y-6" delay={0.15}>
            {/* Section pill */}
            <Badge
              variant="default"
              className="bg-navy text-white hover:bg-navy px-4 py-1.5 text-xs font-medium rounded-full"
            >
              <span className="font-mono mr-2">02</span>
              Jadwal
            </Badge>

            {/* Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-navy leading-tight">
              Jadwal Ibadah & Pelayanan Mingguan
            </h2>

            {/* Service times grid */}
            <div className="grid grid-cols-2 gap-4">
              {jadwal.map((jadwalItem, i) => (
                <motion.div
                  key={jadwalItem.id}
                  className={`relative rounded-2xl border border-gray-line p-4 transition-shadow bg-white ${
                    jadwalItem.linkStreaming ? 'hover:shadow-md hover:border-navy/30 cursor-pointer' : 'hover:shadow-sm'
                  }`}
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.4,
                    delay: shouldReduceMotion ? 0 : 0.3 + i * 0.08,
                    ease: "easeOut",
                  }}
                >
                  {jadwalItem.linkStreaming && (
                    <a
                      href={jadwalItem.linkStreaming}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 z-10 rounded-2xl"
                      aria-label={`Tonton live streaming ${jadwalItem.namaIbadah ?? jadwalItem.jenis}`}
                    >
                      <span className="sr-only">Tonton Live Streaming</span>
                    </a>
                  )}
                  <div className="absolute top-3 right-3">
                    <ArrowUpRight className={`w-4 h-4 ${jadwalItem.linkStreaming ? 'text-navy' : 'text-gray-text'}`} />
                  </div>
                  <p className="font-semibold text-navy text-sm mb-1 pr-5 relative z-0">
                    {jadwalItem.namaIbadah ?? jadwalItem.jenis}
                  </p>
                  <p className="text-gold font-medium text-sm relative z-0">
                    {jadwalItem.waktu}
                  </p>
                  {(jadwalItem.highlight || jadwalItem.linkStreaming) && (
                    <div className="mt-2 flex items-center gap-1 relative z-0">
                      <Play className="w-3 h-3 text-red-500" />
                      <span className="text-xs text-red-500">Live</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {/* Navigation arrows */}
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-full border border-gray-line flex items-center justify-center hover:bg-off-white transition-colors">
                <ChevronLeft className="w-4 h-4 text-navy" />
              </button>
              <button className="w-8 h-8 rounded-full border border-gray-line flex items-center justify-center hover:bg-off-white transition-colors">
                <ChevronRight className="w-4 h-4 text-navy" />
              </button>
            </div>

            {/* Description */}
            <p className="text-gray-text text-sm leading-relaxed">
              Ibadah Hari Minggu dilaksanakan sebanyak 2 (dua) sesi, yakni pada pukul 06.00 WIB sesi pertama dan 09.00 WIB sesi kedua.<br/>
              <strong>Khusus Ibadah Hari Minggu Sakramen Perjamuan (dan Jumat Agung)</strong> dilaksanakan sebanyak 3 (tiga) sesi, yakni pada pukul <strong>06.00 WIB; 10.00 WIB; 18.00 WIB</strong>
            </p>
          </AnimatedSection>
        </div>

        {/* BOTTOM HALF - Pelkat List */}
        <AnimatedSection className="border-t border-gray-line pt-12" delay={0.1}>
          <h3 className="font-semibold text-navy text-lg mb-6 text-center lg:text-left">
            Pelayanan Kategorial
          </h3>

          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden py-10">
            <Marquee pauseOnHover className="[--duration:30s]">
              {pelkat.map((item) => (
                <div
                  key={item.id}
                  className="group/card relative flex w-48 h-48 sm:w-64 sm:h-64 cursor-pointer overflow-hidden rounded-3xl border border-gray-line bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 items-center justify-center p-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-navy/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                  <div className="relative w-full h-full transform group-hover/card:scale-105 transition-transform duration-300">
                    {item.icon ? (
                      <Image
                        src={item.icon}
                        alt={`Logo ${item.nama}`}
                        fill
                        sizes="(min-width: 640px) 256px, 192px"
                        className="object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl font-bold text-navy/20">{item.singkatan ?? item.nama.slice(0, 2)}</span>
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-0 right-0 text-center opacity-0 group-hover/card:opacity-100 transition-opacity duration-300">
                    <Badge variant="secondary" className="bg-navy text-white hover:bg-navy-mid border-none shadow-sm">
                      {item.nama}
                    </Badge>
                  </div>
                </div>
              ))}
            </Marquee>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white to-transparent"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white to-transparent"></div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
