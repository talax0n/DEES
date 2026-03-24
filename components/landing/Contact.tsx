"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { motion, useReducedMotion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Phone, Mail, Clock, Youtube, Instagram, ArrowUpRight, Cross, Loader2 } from "lucide-react"
import { AnimatedSection } from "./AnimatedSection"
import { contactSchema, type ContactFormValues } from "@/lib/validations"
import { CHURCH_INFO } from "@/lib/constants"

export function Contact() {
  const shouldReduceMotion = useReducedMotion()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  })

  async function onSubmit(data: ContactFormValues) {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error()
      toast.success("Pesan Anda telah terkirim!", {
        description: "Kami akan segera menghubungi Anda.",
      })
      reset()
    } catch {
      toast.error("Gagal mengirim pesan", {
        description: "Silakan coba lagi atau hubungi kami langsung.",
      })
    }
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
          <AnimatedSection className="space-y-8">
            <Badge
              variant="outline"
              className="border-white/30 text-white hover:bg-white/10 px-4 py-1.5 text-xs font-medium rounded-full"
            >
              <span className="font-mono mr-2">06</span>
              Kontak
            </Badge>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-white leading-tight">
              Hubungi Kami
            </h2>

            <div className="space-y-6">
              {[
                { icon: MapPin, label: "Alamat", content: CHURCH_INFO.address },
                { icon: Phone, label: "Telepon", content: CHURCH_INFO.phone },
                { icon: Mail, label: "Email", content: CHURCH_INFO.email },
                { icon: Clock, label: "Jam Kantor", content: CHURCH_INFO.officeHours },
              ].map(({ icon: Icon, label, content }, i) => (
                <motion.div
                  key={label}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: shouldReduceMotion ? 0 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.4,
                    delay: shouldReduceMotion ? 0 : 0.2 + i * 0.08,
                    ease: "easeOut",
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-gold" />
                  </div>
                  <div>
                    <p className="text-white/60 text-sm mb-1">{label}</p>
                    <p className="text-white whitespace-pre-line">{content}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center gap-4 pt-4">
              <motion.a
                href={CHURCH_INFO.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"
                whileHover={{ scale: shouldReduceMotion ? 1 : 1.15 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Youtube className="w-5 h-5 text-white" />
              </motion.a>
              <motion.a
                href={CHURCH_INFO.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-gold transition-colors"
                whileHover={{ scale: shouldReduceMotion ? 1 : 1.15 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Instagram className="w-5 h-5 text-white" />
              </motion.a>
            </div>
          </AnimatedSection>

          {/* Right column - Contact form */}
          <motion.div
            className="bg-white rounded-3xl shadow-2xl p-6 lg:p-8"
            style={{ transform: "rotate(-1deg)" }}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.6, delay: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
          >
            <div style={{ transform: "rotate(1deg)" }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center">
                  <Cross className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-medium text-navy">Kirim Pesan</h3>
                  <p className="text-gray-text text-sm">Kami akan segera menghubungi Anda</p>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-navy mb-1.5 block">Nama Lengkap</label>
                  <Input
                    placeholder="Masukkan nama Anda"
                    {...register("nama")}
                    className="rounded-xl border-gray-line focus:border-gold focus:ring-gold"
                  />
                  {errors.nama && <p className="text-red-500 text-xs mt-1">{errors.nama.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-navy mb-1.5 block">Email</label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    {...register("email")}
                    className="rounded-xl border-gray-line focus:border-gold focus:ring-gold"
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium text-navy mb-1.5 block">
                    Telepon <span className="text-gray-text font-normal">(Opsional)</span>
                  </label>
                  <Input
                    placeholder="0812-3456-7890"
                    {...register("telepon")}
                    className="rounded-xl border-gray-line focus:border-gold focus:ring-gold"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-navy mb-1.5 block">Pesan</label>
                  <Textarea
                    placeholder="Tulis pesan Anda di sini..."
                    rows={4}
                    {...register("pesan")}
                    className="rounded-xl border-gray-line focus:border-gold focus:ring-gold resize-none"
                  />
                  {errors.pesan && <p className="text-red-500 text-xs mt-1">{errors.pesan.message}</p>}
                </div>

                <motion.div
                  whileHover={{ scale: shouldReduceMotion ? 1 : 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-navy text-white hover:bg-navy-mid py-3 h-auto flex items-center justify-center gap-2 group"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      <>
                        Kirim Pesan
                        <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </>
                    )}
                  </Button>
                </motion.div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
