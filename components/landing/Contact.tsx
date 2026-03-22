"use client"

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Phone, Mail, Clock, Youtube, Instagram, ArrowUpRight, Cross } from 'lucide-react'

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const handleSubmit = () => {
    // Handle form submission
    console.log('Form submitted:', formData)
    alert('Terima kasih! Pesan Anda telah terkirim.')
    setFormData({ name: '', email: '', phone: '', message: '' })
  }

  return (
    <section id="contact" className="w-full py-20 lg:py-32 bg-navy relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left column - Contact info */}
          <div className="space-y-8">
            {/* Section pill */}
            <Badge
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-4 py-1.5 text-xs font-medium rounded-full"
            >
              <span className="font-mono mr-2">06</span>
              Kontak
            </Badge>

            {/* Headline */}
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-white leading-tight">
              Hubungi Kami
            </h2>

            {/* Contact details */}
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Alamat</p>
                  <p className="text-white">Jl. Damai Sejahtera No. 123<br />Jakarta Selatan, 12345</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Telepon</p>
                  <p className="text-white">(021) 1234-5678</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Email</p>
                  <p className="text-white">info@gpibdamaisejahtera.org</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-gold" />
                </div>
                <div>
                  <p className="text-white/60 text-sm mb-1">Jam Kantor</p>
                  <p className="text-white">Senin - Jumat: 08.00 - 16.00 WIB</p>
                </div>
              </div>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-4 pt-4">
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"
              >
                <Youtube className="w-5 h-5 text-white" />
              </a>
              <a
                href="#"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"
              >
                <Instagram className="w-5 h-5 text-white" />
              </a>
            </div>
          </div>

          {/* Right column - Contact form */}
          <div
            className="bg-white rounded-3xl shadow-2xl p-6 lg:p-8"
            style={{ transform: 'rotate(-1deg)' }}
          >
            <div style={{ transform: 'rotate(1deg)' }}>
              {/* Form header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center">
                  <Cross className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-medium text-navy">Kirim Pesan</h3>
                  <p className="text-gray-text text-sm">Kami akan segera menghubungi Anda</p>
                </div>
              </div>

              {/* Form fields */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-navy mb-1.5 block">Nama Lengkap</label>
                  <Input
                    placeholder="Masukkan nama Anda"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="rounded-xl border-gray-line focus:border-gold focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-navy mb-1.5 block">Email</label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="rounded-xl border-gray-line focus:border-gold focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-navy mb-1.5 block">Telepon (Opsional)</label>
                  <Input
                    placeholder="0812-3456-7890"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="rounded-xl border-gray-line focus:border-gold focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-navy mb-1.5 block">Pesan</label>
                  <Textarea
                    placeholder="Tulis pesan Anda di sini..."
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="rounded-xl border-gray-line focus:border-gold focus:ring-gold resize-none"
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full rounded-xl bg-navy text-white hover:bg-navy-mid py-3 h-auto flex items-center justify-center gap-2 group"
                >
                  Kirim Pesan
                  <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
