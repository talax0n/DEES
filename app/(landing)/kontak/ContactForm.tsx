"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpRight, Cross, Loader2 } from "lucide-react";
import { contactSchema, type ContactFormValues } from "@/lib/validations";
import { motion, useReducedMotion } from "framer-motion";

export function ContactForm() {
  const shouldReduce = useReducedMotion();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  async function onSubmit(data: ContactFormValues) {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Gagal mengirim pesan");
      toast.success("Pesan Anda telah terkirim!", {
        description: "Kami akan segera menghubungi Anda.",
      });
      reset();
    } catch {
      toast.error("Gagal mengirim pesan", {
        description: "Silakan coba lagi atau hubungi kami langsung.",
      });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduce ? 0 : 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: shouldReduce ? 0 : 0.5 }}
      className="bg-white rounded-3xl border border-gray-line shadow-sm p-6 lg:p-8"
    >
      {/* Form header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-navy flex items-center justify-center">
          <Cross className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-serif text-xl font-medium text-navy">Kirim Pesan</h2>
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
      </form>
    </motion.div>
  );
}
