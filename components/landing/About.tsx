"use client"

import { useEffect, useRef, useState } from 'react'
import { motion, useInView, useReducedMotion, animate } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { ArrowUpRight, Cross } from 'lucide-react'
import { AnimatedSection } from './AnimatedSection'

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    if (!inView) return
    if (shouldReduceMotion) {
      const frame = requestAnimationFrame(() => setCount(target))
      return () => cancelAnimationFrame(frame)
    }
    const controls = animate(0, target, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (v) => setCount(Math.round(v)),
    })
    return controls.stop
  }, [inView, target, shouldReduceMotion])

  return <span ref={ref}>{count}{suffix}</span>
}

export function About() {
  return (
    <section id="about" className="w-full py-20 lg:py-32 bg-off-white relative overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left column - 40% */}
          <AnimatedSection className="lg:col-span-5 space-y-6">
            {/* Section pill */}
            <Badge
              variant="default"
              className="bg-navy text-white hover:bg-navy px-4 py-1.5 text-xs font-medium rounded-full"
            >
              <span className="font-mono mr-2">01</span>
              Sekilas Sejarah
            </Badge>

            {/* Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-navy leading-tight">
              GPIB DAMAI SEJAHTERA
            </h2>

            {/* Body text */}
            <p className="text-gray-text text-base lg:text-lg leading-relaxed">
              GPIB jemaat &quot;DAMAI SEJAHTERA&quot; di Bogor - MUPEL (Musyawarah Pelayanan) Jawa Barat. Gereja Protestan di Indonesia bagian Barat (disingkat GPIB) adalah kumpulan persekutuan umat percaya Kristen Protestan di Indonesia. GPIB merupakan bagian dari Gereja Protestan di Indonesia (GPI) yang pada jaman Hindia Belanda bernama De Protestantse Kerk In Westelijk Indonesie.
            </p>

            {/* CTA Link */}
            <motion.a
              href="#"
              className="inline-flex items-center gap-2 text-navy font-medium hover:text-gold transition-colors group"
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Sejarah Singkat
              <span className="w-8 h-8 rounded-full bg-navy text-white flex items-center justify-center group-hover:bg-gold transition-colors">
                <ArrowUpRight className="w-4 h-4" />
              </span>
            </motion.a>
          </AnimatedSection>

          {/* Center decorative element */}
          <div className="hidden lg:flex lg:col-span-1 justify-center">
            <div className="relative flex items-center">
              <div className="w-px h-32 bg-gray-line" />
              <div className="absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center">
                <Cross className="w-5 h-5 text-gold" />
              </div>
            </div>
          </div>

          {/* Right column - 60% */}
          <AnimatedSection className="lg:col-span-6 relative" delay={0.2}>
            {/* Main image card with rotation */}
            <div
              className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3]"
              style={{ transform: 'rotate(2deg)' }}
            >
              <Image
                src="/INTERIOR.jpg"
                alt="Interior Gereja GPIB Damai Sejahtera"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>

            {/* Floating stat cards */}
            <div
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 lg:translate-x-0 lg:-bottom-6 lg:-left-8 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-4 sm:p-6 z-10 w-[92%] sm:w-max flex flex-row items-center justify-around sm:justify-start gap-2 sm:gap-6 divide-x divide-gray-200 ring-1 ring-gray-900/5"
            >
              <div className="text-center px-2 sm:px-4 first:pl-0 last:pr-0">
                <p className="font-serif text-xl sm:text-3xl font-bold text-navy">
                  <AnimatedCounter target={700} suffix="+" />
                </p>
                <p className="text-gray-text text-[10px] sm:text-sm font-medium mt-0.5 sm:mt-1 uppercase tracking-wide">Keluarga</p>
              </div>

              <div className="text-center px-2 sm:px-4 first:pl-0 last:pr-0">
                <p className="font-serif text-xl sm:text-3xl font-bold text-navy">
                  <AnimatedCounter target={4} />
                </p>
                <p className="text-gray-text text-[10px] sm:text-sm font-medium mt-0.5 sm:mt-1 uppercase tracking-wide">Pendeta</p>
              </div>

              <div className="text-center px-2 sm:px-4 first:pl-0 last:pr-0">
                <p className="font-serif text-xl sm:text-3xl font-bold text-navy">
                  <AnimatedCounter target={4} />
                </p>
                <p className="text-gray-text text-[10px] sm:text-sm font-medium mt-0.5 sm:mt-1 uppercase tracking-wide">Sektor</p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}
