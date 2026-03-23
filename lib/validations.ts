import { z } from 'zod'

export const jadwalSchema = z.object({
  namaIbadah: z.string().min(1, 'Nama ibadah wajib diisi'),
  hari: z.string().min(1, 'Hari wajib diisi'),
  waktu: z.string().min(1, 'Waktu wajib diisi'),
  lokasi: z.string().min(1, 'Lokasi wajib diisi'),
  metode: z.enum(['online', 'offline', 'hybrid']),
  linkStreaming: z.string().url('URL tidak valid').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
})

export const unduhanSchema = z.object({
  judul: z.string().min(1, 'Judul wajib diisi'),
  tipe: z.enum(['TAIB', 'WARTA']),
  tanggal: z.coerce.date(),
})

export const dokumentasiEventSchema = z.object({
  namaAcara: z.string().min(1, 'Nama acara wajib diisi'),
  tanggal: z.coerce.date(),
})

export const contactSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  telepon: z.string().optional(),
  pesan: z.string().min(10, 'Pesan minimal 10 karakter'),
})

export type JadwalFormValues = z.infer<typeof jadwalSchema>
export type UnduhanFormValues = z.infer<typeof unduhanSchema>
export type DokumentasiEventFormValues = z.infer<typeof dokumentasiEventSchema>
export type ContactFormValues = z.infer<typeof contactSchema>
