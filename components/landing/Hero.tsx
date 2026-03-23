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
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/hero.jpg')`,
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
