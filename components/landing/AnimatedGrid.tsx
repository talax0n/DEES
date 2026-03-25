"use client"
import React from "react"
import { motion, useReducedMotion } from "framer-motion"

interface AnimatedGridProps {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}

export function AnimatedGrid({ children, className, staggerDelay = 0.08 }: AnimatedGridProps) {
  const shouldReduce = useReducedMotion()
  const items = React.Children.toArray(children)
  return (
    <div className={className}>
      {items.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: shouldReduce ? 0 : 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: shouldReduce ? 0 : 0.5, delay: shouldReduce ? 0 : i * staggerDelay, ease: "easeOut" }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  )
}
