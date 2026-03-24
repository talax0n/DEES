"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  ArrowUpRight,
  ChevronRight,
  ChevronLeft,
  Baby,
  GraduationCap,
  Users,
  Heart,
  Shield,
  Star,
  Play,
} from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";
import { Marquee } from "@/components/ui/marquee";
import Image from "next/image";
import { jadwalIbadah as fallbackJadwal, pelkat as fallbackPelkat } from "@/lib/data";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Baby,
  GraduationCap,
  Users,
  Heart,
  Shield,
  Star,
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

interface PelkatItem {
  id: string
  nama: string
  singkatan?: string
  icon?: string | null
  iconUrl?: string | null
}

interface ProgramsProps {
  jadwal?: JadwalItem[]
  pelkat?: PelkatItem[]
}

export function Programs({ jadwal, pelkat }: ProgramsProps) {
  const [expandedPelkat, setExpandedPelkat] = useState<string>("1");
  const shouldReduceMotion = useReducedMotion();

  const jadwalData = jadwal && jadwal.length > 0 ? jadwal : fallbackJadwal as JadwalItem[]
  const pelkatData = pelkat && pelkat.length > 0 ? pelkat : fallbackPelkat as PelkatItem[]

  return (
    <section id="programs" className="w-full py-20 lg:py-32 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* TOP HALF - Two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-16">
          {/* Left - Large photo card */}
          <AnimatedSection>
            <div className="rounded-3xl overflow-hidden aspect-[4/3] bg-gradient-to-br from-navy to-navy-mid relative">
              {/* Placeholder for congregation image */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Users className="w-24 h-24 text-white/20" />
              </div>
              {/* Live badge */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-red-500 text-white hover:bg-red-600 px-3 py-1 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  Live on YouTube
                </Badge>
              </div>
            </div>
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
              {jadwalData.map((jadwal, i) => (
                <motion.div
                  key={jadwal.id}
                  className="relative rounded-2xl border border-gray-line p-4 hover:shadow-md transition-shadow bg-white"
                  initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.4,
                    delay: shouldReduceMotion ? 0 : 0.3 + i * 0.08,
                    ease: "easeOut",
                  }}
                >
                  <div className="absolute top-3 right-3">
                    <ArrowUpRight className="w-4 h-4 text-gray-text" />
                  </div>
                  <p className="font-semibold text-navy text-sm mb-1 pr-5">
                    {jadwal.namaIbadah ?? jadwal.jenis}
                  </p>
                  <p className="text-gold font-medium text-sm">
                    {jadwal.waktu}
                  </p>
                  {(jadwal.highlight || jadwal.linkStreaming) && (
                    <div className="mt-2 flex items-center gap-1">
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
              {pelkatData.map((item) => (
                <div
                  key={item.id}
                  className="group/card relative flex w-48 h-48 sm:w-64 sm:h-64 cursor-pointer overflow-hidden rounded-3xl border border-gray-line bg-white hover:shadow-xl transition-all duration-300 items-center justify-center p-6"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-navy/5 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300" />
                  <div className="relative w-full h-full transform group-hover/card:scale-105 transition-transform duration-300">
                    {(item.icon ?? item.iconUrl) ? (
                      <Image
                        src={(item.icon ?? item.iconUrl)!}
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
            <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white dark:from-background"></div>
            <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white dark:from-background"></div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
