"use client"

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import { useScrollY } from '@/hooks/useScrollY'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, ArrowUpRight } from 'lucide-react'

const navLinks = [
  { label: 'Tentang Gereja', href: '/#about' },
  { label: 'Jadwal', href: '/jadwal' },
  { label: 'Unduhan', href: '/unduhan' },
  { label: 'Event', href: '/dokumentasi' },
]

export function Navbar() {
  const scrollY = useScrollY()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const isLandingPage = pathname === '/'
  const isScrolled = !isLandingPage || scrollY > 50

  // Show title in navbar when user scrolls past a significant portion of the hero section on landing page,
  // or always show it on other pages.
  const threshold = typeof window !== 'undefined' ? window.innerHeight * 0.7 : 600
  const showTitle = !isLandingPage || scrollY > threshold

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <nav className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" passHref legacyBehavior>
            <motion.a
              className="flex items-center gap-2 group"
              initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: "easeOut" }}
            >
              <div className="relative w-9 h-9 shrink-0">
                <Image
                  src="/LOGO.png"
                  alt="Logo GPIB"
                  fill
                  sizes="36px"
                  className="object-contain"
                />
              </div>
              <AnimatePresence>
                {showTitle && (
                  <motion.span
                    initial={{ opacity: 0, width: 0, marginLeft: 0 }}
                    animate={{ opacity: 1, width: "auto", marginLeft: 8 }}
                    exit={{ opacity: 0, width: 0, marginLeft: 0 }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className={`font-serif font-semibold text-sm lg:text-base transition-colors whitespace-nowrap overflow-hidden ${
                      isScrolled ? 'text-navy' : 'text-white'
                    }`}
                  >
                    GPIB Damai Sejahtera
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.a>
          </Link>

          {/* Desktop Navigation */}
          <motion.div
            className="hidden lg:flex items-center gap-8"
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: "easeOut", delay: shouldReduceMotion ? 0 : 0.1 }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:opacity-70 ${
                  isScrolled ? 'text-navy' : 'text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </motion.div>

          {/* Desktop CTA Buttons */}
          <motion.div
            className="hidden lg:flex items-center gap-3"
            initial={{ opacity: 0, x: shouldReduceMotion ? 0 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: "easeOut", delay: shouldReduceMotion ? 0 : 0.2 }}
          >
            <motion.div whileHover={{ scale: shouldReduceMotion ? 1 : 1.02 }}>
              <Button
                asChild
                className={`rounded-full px-5 py-2 text-sm font-medium transition-all bg-transparent border ${
                  isScrolled
                    ? 'border-navy text-navy hover:bg-navy/5 hover:text-navy dark:border-navy dark:text-navy dark:hover:bg-navy/5'
                    : 'border-white text-white hover:bg-white/10 hover:text-white dark:border-white dark:text-white dark:hover:bg-white/10'
                }`}
              >
                <Link href="/kontak">Hubungi Kami</Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: shouldReduceMotion ? 1 : 1.02 }}>
              <Button
                asChild
                className="rounded-full px-5 py-2 text-sm font-medium bg-navy text-white hover:bg-navy-mid flex items-center gap-1 dark:bg-navy dark:text-white dark:hover:bg-navy-mid border-none"
              >
                <Link href="/login">
                  Masuk
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className={isScrolled ? 'text-navy' : 'text-white'}
              >
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] bg-white">
              <div className="flex flex-col gap-6 mt-8">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <div className="relative w-8 h-8 shrink-0">
                    <Image
                      src="/LOGO.png"
                      alt="Logo GPIB"
                      fill
                      sizes="32px"
                      className="object-contain"
                    />
                  </div>
                  <span className="font-serif font-semibold text-navy">
                    GPIB Damai Sejahtera
                  </span>
                </Link>
                <div className="flex flex-col gap-4 mt-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-navy font-medium py-2 border-b border-gray-line"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div className="flex flex-col gap-3 mt-4">
                  <Button
                    asChild
                    className="rounded-full border border-navy text-navy w-full bg-transparent hover:bg-navy/5 hover:text-navy dark:border-navy dark:text-navy dark:bg-transparent dark:hover:bg-navy/5"
                  >
                    <Link href="/kontak" onClick={() => setIsOpen(false)}>
                      Hubungi Kami
                    </Link>
                  </Button>
                  <Button asChild className="rounded-full bg-navy text-white w-full flex items-center justify-center gap-1 dark:bg-navy dark:text-white dark:hover:bg-navy-mid border-none">
                    <Link href="/login" onClick={() => setIsOpen(false)}>
                      Masuk
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </nav>
      </div>
    </header>
  )
}

