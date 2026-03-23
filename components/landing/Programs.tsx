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
import { jadwalIbadah, pelkat } from "@/lib/data";
import { AnimatedSection } from "./AnimatedSection";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Baby,
  GraduationCap,
  Users,
  Heart,
  Shield,
  Star,
};

export function Programs() {
  const [expandedPelkat, setExpandedPelkat] = useState<string>("1");
  const shouldReduceMotion = useReducedMotion();

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
              {jadwalIbadah.map((jadwal, i) => (
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
                    {jadwal.jenis}
                  </p>
                  <p className="text-gold font-medium text-sm">
                    {jadwal.waktu}
                  </p>
                  {jadwal.highlight && (
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
              Pelayanan kami adalah ritme kehidupan rohani jemaat: ibadah
              mingguan, persekutuan doa, pendalaman Alkitab, dan pertemuan
              lintas usia.
            </p>
          </AnimatedSection>
        </div>

        {/* BOTTOM HALF - Pelkat List */}
        <AnimatedSection className="border-t border-gray-line pt-12" delay={0.1}>
          <h3 className="font-semibold text-navy text-lg mb-6">
            Pelkat tahun ini
          </h3>

          <div className="space-y-2">
            {pelkat.map((item) => {
              const Icon = iconMap[item.icon] || Users;
              const isExpanded = expandedPelkat === item.id;

              return (
                <div
                  key={item.id}
                  className={`group rounded-xl transition-all duration-300 ${
                    isExpanded ? "bg-off-white" : "hover:bg-off-white"
                  }`}
                >
                  <button
                    onClick={() => setExpandedPelkat(isExpanded ? "" : item.id)}
                    className="w-full flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-gold font-bold font-mono text-lg">
                        {item.id.padStart(2, "0")}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-navy/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-navy" />
                        </div>
                        <span className="font-medium text-navy">
                          {item.nama}
                        </span>
                      </div>
                    </div>
                    <motion.div
                      className={`w-8 h-8 rounded-full border border-gray-line flex items-center justify-center transition-colors group-hover:border-gold group-hover:bg-gold ${
                        isExpanded ? "bg-gold border-gold" : ""
                      }`}
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
                    >
                      <ChevronRight className="w-4 h-4 text-navy" />
                    </motion.div>
                  </button>

                  {/* Expanded content with AnimatePresence */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          height: { duration: shouldReduceMotion ? 0 : 0.3, ease: "easeOut" },
                          opacity: { duration: shouldReduceMotion ? 0 : 0.2 },
                        }}
                        style={{ overflow: "hidden" }}
                      >
                        <div className="px-4 pb-4 pl-16">
                          <div className="bg-white rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="text-xs">
                                {item.targetGroup}
                              </Badge>
                            </div>
                            <p className="text-gray-text text-sm leading-relaxed">
                              {item.deskripsi}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
