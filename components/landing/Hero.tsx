"use client"

import { motion, useReducedMotion, type Transition } from "framer-motion"
import { ArrowDown } from "lucide-react"

export function Hero() {
  const shouldReduceMotion = useReducedMotion()

  const fadeUp = (delay: number) => {
    const transition: Transition = {
      duration: shouldReduceMotion ? 0 : 0.6,
      ease: "easeOut",
      delay: shouldReduceMotion ? 0 : delay,
    }
    return {
      initial: { opacity: 0, y: shouldReduceMotion ? 0 : 30 },
      animate: { opacity: 1, y: 0 },
      transition,
    }
  }

  return (
    <section className="relative w-full h-screen min-h-[600px] overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        {/* Placeholder gradient background - replace with actual church image */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-navy-mid via-navy to-[#0f1419]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Dark gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Top-left overlay - welcome quote */}
        <motion.div
          className="absolute top-20 lg:top-24 left-4 sm:left-6 lg:left-8 xl:left-12 max-w-xs"
          {...fadeUp(0.3)}
        >
          {/* Avatar stack */}
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-gold/80 flex items-center justify-center text-white text-xs font-semibold border-2 border-white/30 -ml-0">
              JM
            </div>
            <div className="w-10 h-10 rounded-full bg-navy-mid flex items-center justify-center text-white text-xs font-semibold border-2 border-white/30 -ml-3">
              SR
            </div>
            <div className="w-10 h-10 rounded-full bg-gold flex items-center justify-center text-white text-xs font-semibold border-2 border-white/30 -ml-3">
              AL
            </div>
          </div>
          {/* Welcome text */}
          <p className="text-white/90 text-sm lg:text-base italic leading-relaxed">
            &quot;Kami menyambut Anda di keluarga rohani kami — tempat di mana
            hati menemukan kedamaian, jiwa dipenuhi iman, dan setiap langkah
            membawa Anda lebih dekat pada cahaya kasih Tuhan.&quot;
          </p>
        </motion.div>

        {/* Bottom-left headline */}
        <motion.h1
          className="absolute bottom-12 lg:bottom-16 left-4 sm:left-6 lg:left-8 xl:left-12 max-w-xl font-serif text-white text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-medium leading-[1.1] tracking-tight"
          {...fadeUp(0)}
        >
          Selamat datang
          <br />
          di keluarga kami.
          <br />
          Semua disambut.
        </motion.h1>

        {/* Bottom-right scroll indicator */}
        <motion.div
          className="absolute bottom-12 lg:bottom-16 right-4 sm:right-6 lg:right-8 xl:right-12 flex flex-col items-center gap-2"
          {...fadeUp(0.6)}
        >
          <span className="text-white/80 text-sm">Scroll Down</span>
          <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center animate-bounce">
            <ArrowDown className="w-5 h-5 text-white" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
