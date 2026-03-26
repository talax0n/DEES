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

export const schedulePeriodSchema = z.object({
  bulan: z.number().min(1).max(12),
  tahun: z.number().min(2024).max(2100),
  notes: z.string().optional(),
  deadlineAvailability: z.coerce.date().optional(),
})

export const scheduleEventSchema = z.object({
  namaEvent: z.string().min(1, 'Nama event wajib diisi'),
  tanggal: z.coerce.date(),
  waktu: z.string().min(1, 'Waktu wajib diisi'),
  kategori: z.string().min(1),
  keterangan: z.string().optional(),
  isLive: z.boolean().default(false),
  requiredRoles: z.array(z.enum(['SLD', 'SND', 'STR', 'CAM'])).min(1, 'Minimal 1 role diperlukan'),
})

export const multimediaMemberSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  phone: z.string().optional(),
  serviceRoles: z.array(z.enum(['SLD', 'SND', 'STR', 'CAM'])).min(1, 'Minimal 1 kemampuan'),
})

export const availabilitySubmissionSchema = z.object({
  memberId: z.string().min(1),
  availability: z.array(z.object({
    eventId: z.string().min(1),
    status: z.enum(['AVAILABLE', 'UNAVAILABLE']),
  })).min(1),
})
