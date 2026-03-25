"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"

export function PageTransition({ children }: { children: ReactNode }) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: shouldReduceMotion ? 0 : 0.4, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}
