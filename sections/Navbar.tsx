"use client"

import { useState } from 'react'
import { useScrollY } from '@/hooks/useScrollY'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, ArrowUpRight, Cross } from 'lucide-react'

const navLinks = [
  { label: 'Tentang Gereja', href: '#about' },
  { label: 'Pelayanan', href: '#programs' },
  { label: 'Unduhan', href: '#downloads' },
]

export function Navbar() {
  const scrollY = useScrollY()
  const [isOpen, setIsOpen] = useState(false)
  const isScrolled = scrollY > 50

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
          <a href="#" className="flex items-center gap-2 group">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isScrolled ? 'bg-navy' : 'bg-white/20'
            }`}>
              <Cross className={`w-4 h-4 ${isScrolled ? 'text-white' : 'text-white'}`} />
            </div>
            <span className={`font-serif font-semibold text-sm lg:text-base transition-colors ${
              isScrolled ? 'text-navy' : 'text-white'
            }`}>
              GPIB Damai Sejahtera
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:opacity-70 ${
                  isScrolled ? 'text-navy' : 'text-white'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              variant="outline"
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                isScrolled
                  ? 'border-navy text-navy hover:bg-navy hover:text-white'
                  : 'border-white text-white hover:bg-white hover:text-navy'
              }`}
            >
              Hubungi Kami
            </Button>
            <Button
              className="rounded-full px-5 py-2 text-sm font-medium bg-navy text-white hover:bg-navy-mid flex items-center gap-1"
            >
              Masuk
              <ArrowUpRight className="w-4 h-4" />
            </Button>
          </div>

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
                <a href="#" className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center">
                    <Cross className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-serif font-semibold text-navy">
                    GPIB Damai Sejahtera
                  </span>
                </a>
                <div className="flex flex-col gap-4 mt-4">
                  {navLinks.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className="text-navy font-medium py-2 border-b border-gray-line"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
                <div className="flex flex-col gap-3 mt-4">
                  <Button
                    variant="outline"
                    className="rounded-full border-navy text-navy w-full"
                  >
                    Hubungi Kami
                  </Button>
                  <Button className="rounded-full bg-navy text-white w-full flex items-center justify-center gap-1">
                    Masuk
                    <ArrowUpRight className="w-4 h-4" />
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
