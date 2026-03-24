import { describe, it, expect } from 'vitest'
import { jadwalIbadah } from '@/lib/data/jadwal'
import { pelkat } from '@/lib/data/pelkat'
import { unduhan } from '@/lib/data/unduhan'
import { dokumentasi } from '@/lib/data/dokumentasi'

// ---------------------------------------------------------------------------
// jadwalIbadah
// ---------------------------------------------------------------------------
describe('jadwalIbadah static data', () => {
  it('is an array with at least 1 item', () => {
    expect(Array.isArray(jadwalIbadah)).toBe(true)
    expect(jadwalIbadah.length).toBeGreaterThanOrEqual(1)
  })

  it('each item has required fields: id, jenis, waktu, metode', () => {
    for (const item of jadwalIbadah) {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('jenis')
      expect(item).toHaveProperty('waktu')
      expect(item).toHaveProperty('metode')
    }
  })

  it('all ids are non-empty strings', () => {
    for (const item of jadwalIbadah) {
      expect(typeof item.id).toBe('string')
      expect(item.id.length).toBeGreaterThan(0)
    }
  })

  it('all jenis are non-empty strings', () => {
    for (const item of jadwalIbadah) {
      expect(typeof item.jenis).toBe('string')
      expect(item.jenis.length).toBeGreaterThan(0)
    }
  })

  it('items with highlight: true have streamingUrl', () => {
    for (const item of jadwalIbadah) {
      if (item.highlight) {
        expect(item).toHaveProperty('streamingUrl')
        expect(typeof (item as { streamingUrl?: string }).streamingUrl).toBe('string')
      }
    }
  })
})

// ---------------------------------------------------------------------------
// pelkat
// ---------------------------------------------------------------------------
describe('pelkat static data', () => {
  it('has exactly 6 items', () => {
    expect(pelkat).toHaveLength(6)
  })

  it('each item has id, singkatan, nama, targetGroup, deskripsi, icon', () => {
    for (const item of pelkat) {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('singkatan')
      expect(item).toHaveProperty('nama')
      expect(item).toHaveProperty('targetGroup')
      expect(item).toHaveProperty('deskripsi')
      expect(item).toHaveProperty('icon')
    }
  })

  it('singkatan values are unique', () => {
    const singkatanList = pelkat.map((p) => p.singkatan)
    const unique = new Set(singkatanList)
    expect(unique.size).toBe(pelkat.length)
  })

  it('contains PA, PT, GP, PKP, PKB, PKLU', () => {
    const singkatanList = pelkat.map((p) => p.singkatan)
    expect(singkatanList).toContain('PA')
    expect(singkatanList).toContain('PT')
    expect(singkatanList).toContain('GP')
    expect(singkatanList).toContain('PKP')
    expect(singkatanList).toContain('PKB')
    expect(singkatanList).toContain('PKLU')
  })

  it('all string fields are non-empty', () => {
    for (const item of pelkat) {
      expect(item.id.length).toBeGreaterThan(0)
      expect(item.singkatan.length).toBeGreaterThan(0)
      expect(item.nama.length).toBeGreaterThan(0)
      expect(item.deskripsi.length).toBeGreaterThan(0)
    }
  })
})

// ---------------------------------------------------------------------------
// unduhan
// ---------------------------------------------------------------------------
describe('unduhan static data', () => {
  it('is an array with at least 1 item', () => {
    expect(Array.isArray(unduhan)).toBe(true)
    expect(unduhan.length).toBeGreaterThanOrEqual(1)
  })

  it('each item has id, tipe, tanggal, judul, url', () => {
    for (const item of unduhan) {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('tipe')
      expect(item).toHaveProperty('tanggal')
      expect(item).toHaveProperty('judul')
      expect(item).toHaveProperty('url')
    }
  })

  it('tipe is either "tata-ibadah" or "warta"', () => {
    const validTypes = ['tata-ibadah', 'warta']
    for (const item of unduhan) {
      expect(validTypes).toContain(item.tipe)
    }
  })

  it('tanggal is a valid date string (YYYY-MM-DD)', () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    for (const item of unduhan) {
      expect(dateRegex.test(item.tanggal)).toBe(true)
      expect(new Date(item.tanggal).toString()).not.toBe('Invalid Date')
    }
  })

  it('judul is non-empty for all items', () => {
    for (const item of unduhan) {
      expect(item.judul.length).toBeGreaterThan(0)
    }
  })
})

// ---------------------------------------------------------------------------
// dokumentasi
// ---------------------------------------------------------------------------
describe('dokumentasi static data', () => {
  it('is an array with at least 1 item', () => {
    expect(Array.isArray(dokumentasi)).toBe(true)
    expect(dokumentasi.length).toBeGreaterThanOrEqual(1)
  })

  it('each item has id, namaAcara, tanggal, coverPhoto, totalFoto, photos', () => {
    for (const item of dokumentasi) {
      expect(item).toHaveProperty('id')
      expect(item).toHaveProperty('namaAcara')
      expect(item).toHaveProperty('tanggal')
      expect(item).toHaveProperty('coverPhoto')
      expect(item).toHaveProperty('totalFoto')
      expect(item).toHaveProperty('photos')
    }
  })

  it('photos is an array', () => {
    for (const item of dokumentasi) {
      expect(Array.isArray(item.photos)).toBe(true)
    }
  })

  it('totalFoto is a number >= 0', () => {
    for (const item of dokumentasi) {
      expect(typeof item.totalFoto).toBe('number')
      expect(item.totalFoto).toBeGreaterThanOrEqual(0)
    }
  })

  it('namaAcara is non-empty for all items', () => {
    for (const item of dokumentasi) {
      expect(item.namaAcara.length).toBeGreaterThan(0)
    }
  })

  it('tanggal is a valid date string', () => {
    for (const item of dokumentasi) {
      expect(new Date(item.tanggal).toString()).not.toBe('Invalid Date')
    }
  })
})
