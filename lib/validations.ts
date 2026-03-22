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

export const kegiatanSchema = z.object({
  judul: z.string().min(1, 'Judul wajib diisi'),
  slug: z.string().min(1, 'Slug wajib diisi').regex(/^[a-z0-9-]+$/, 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung'),
  deskripsi: z.string().min(1, 'Deskripsi wajib diisi'),
  tanggal: z.coerce.date(),
  lokasi: z.string().optional(),
  isPublished: z.boolean().default(false),
})

export const contactSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().email('Email tidak valid'),
  telepon: z.string().optional(),
  pesan: z.string().min(10, 'Pesan minimal 10 karakter'),
})

export type JadwalFormValues = z.infer<typeof jadwalSchema>
export type UnduhanFormValues = z.infer<typeof unduhanSchema>
export type KegiatanFormValues = z.infer<typeof kegiatanSchema>
export type ContactFormValues = z.infer<typeof contactSchema>
