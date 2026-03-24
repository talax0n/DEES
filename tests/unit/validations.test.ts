import { describe, it, expect } from 'vitest'
import {
  jadwalSchema,
  unduhanSchema,
  dokumentasiEventSchema,
  contactSchema,
} from '@/lib/validations'

// ---------------------------------------------------------------------------
// jadwalSchema
// ---------------------------------------------------------------------------
describe('jadwalSchema', () => {
  const valid = {
    namaIbadah: 'Ibadah Minggu',
    hari: 'Minggu',
    waktu: '09:00',
    lokasi: 'Gedung Gereja',
    metode: 'offline' as const,
  }

  it('accepts valid jadwal data', () => {
    const result = jadwalSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('accepts jadwal with linkStreaming URL', () => {
    const result = jadwalSchema.safeParse({
      ...valid,
      linkStreaming: 'https://youtube.com/live/abc',
    })
    expect(result.success).toBe(true)
  })

  it('accepts jadwal with empty string linkStreaming', () => {
    const result = jadwalSchema.safeParse({ ...valid, linkStreaming: '' })
    expect(result.success).toBe(true)
  })

  it('rejects empty namaIbadah', () => {
    const result = jadwalSchema.safeParse({ ...valid, namaIbadah: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nama ibadah wajib diisi')
    }
  })

  it('rejects empty hari', () => {
    const result = jadwalSchema.safeParse({ ...valid, hari: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty waktu', () => {
    const result = jadwalSchema.safeParse({ ...valid, waktu: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty lokasi', () => {
    const result = jadwalSchema.safeParse({ ...valid, lokasi: '' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid metode', () => {
    const result = jadwalSchema.safeParse({ ...valid, metode: 'tatap-muka' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid linkStreaming URL', () => {
    const result = jadwalSchema.safeParse({
      ...valid,
      linkStreaming: 'not-a-url',
    })
    expect(result.success).toBe(false)
  })

  it('accepts metode: online', () => {
    const result = jadwalSchema.safeParse({ ...valid, metode: 'online' })
    expect(result.success).toBe(true)
  })

  it('accepts metode: hybrid', () => {
    const result = jadwalSchema.safeParse({ ...valid, metode: 'hybrid' })
    expect(result.success).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// unduhanSchema
// ---------------------------------------------------------------------------
describe('unduhanSchema', () => {
  it('accepts valid unduhan (tipe: TAIB)', () => {
    const result = unduhanSchema.safeParse({
      judul: 'Tata Ibadah Minggu',
      tipe: 'TAIB',
      tanggal: '2025-03-16',
    })
    expect(result.success).toBe(true)
  })

  it('accepts tipe: WARTA', () => {
    const result = unduhanSchema.safeParse({
      judul: 'Warta Jemaat',
      tipe: 'WARTA',
      tanggal: '2025-03-16',
    })
    expect(result.success).toBe(true)
  })

  it('coerces tanggal string to Date', () => {
    const result = unduhanSchema.safeParse({
      judul: 'Tata Ibadah',
      tipe: 'TAIB',
      tanggal: '2025-03-16',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tanggal).toBeInstanceOf(Date)
    }
  })

  it('rejects empty judul', () => {
    const result = unduhanSchema.safeParse({
      judul: '',
      tipe: 'TAIB',
      tanggal: '2025-03-16',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid tipe', () => {
    const result = unduhanSchema.safeParse({
      judul: 'Judul',
      tipe: 'INVALID',
      tanggal: '2025-03-16',
    })
    expect(result.success).toBe(false)
  })

  it('rejects missing tanggal', () => {
    const result = unduhanSchema.safeParse({ judul: 'Judul', tipe: 'TAIB' })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// dokumentasiEventSchema
// ---------------------------------------------------------------------------
describe('dokumentasiEventSchema', () => {
  it('accepts valid event', () => {
    const result = dokumentasiEventSchema.safeParse({
      namaAcara: 'Ibadah Natal 2025',
      tanggal: '2025-12-25',
    })
    expect(result.success).toBe(true)
  })

  it('coerces tanggal string to Date', () => {
    const result = dokumentasiEventSchema.safeParse({
      namaAcara: 'Natal',
      tanggal: '2025-12-25',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tanggal).toBeInstanceOf(Date)
    }
  })

  it('rejects empty namaAcara', () => {
    const result = dokumentasiEventSchema.safeParse({
      namaAcara: '',
      tanggal: '2025-12-25',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Nama acara wajib diisi')
    }
  })

  it('rejects missing tanggal', () => {
    const result = dokumentasiEventSchema.safeParse({ namaAcara: 'Natal' })
    expect(result.success).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// contactSchema
// ---------------------------------------------------------------------------
describe('contactSchema', () => {
  it('accepts valid contact', () => {
    const result = contactSchema.safeParse({
      nama: 'Budi Santoso',
      email: 'budi@example.com',
      pesan: 'Ini adalah pesan yang cukup panjang.',
    })
    expect(result.success).toBe(true)
  })

  it('accepts optional telepon', () => {
    const result = contactSchema.safeParse({
      nama: 'Budi',
      email: 'budi@example.com',
      telepon: '08123456789',
      pesan: 'Pesan panjang minimal sepuluh karakter.',
    })
    expect(result.success).toBe(true)
  })

  it('accepts without telepon', () => {
    const result = contactSchema.safeParse({
      nama: 'Budi',
      email: 'budi@example.com',
      pesan: 'Pesan panjang minimal sepuluh karakter.',
    })
    expect(result.success).toBe(true)
  })

  it('rejects empty nama', () => {
    const result = contactSchema.safeParse({
      nama: '',
      email: 'budi@example.com',
      pesan: 'Pesan panjang cukup.',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid email', () => {
    const result = contactSchema.safeParse({
      nama: 'Budi',
      email: 'bukan-email',
      pesan: 'Pesan panjang cukup.',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Email tidak valid')
    }
  })

  it('rejects pesan under 10 characters', () => {
    const result = contactSchema.safeParse({
      nama: 'Budi',
      email: 'budi@example.com',
      pesan: 'Pendek',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('Pesan minimal 10 karakter')
    }
  })
})
