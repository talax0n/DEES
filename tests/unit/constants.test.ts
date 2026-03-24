import { describe, it, expect } from 'vitest'
import { CHURCH_INFO, NAV_LINKS, PELKAT_SINGKATAN } from '@/lib/constants'

describe('CHURCH_INFO', () => {
  it('has all required fields', () => {
    expect(CHURCH_INFO).toHaveProperty('name')
    expect(CHURCH_INFO).toHaveProperty('tagline')
    expect(CHURCH_INFO).toHaveProperty('address')
    expect(CHURCH_INFO).toHaveProperty('phone')
    expect(CHURCH_INFO).toHaveProperty('email')
    expect(CHURCH_INFO).toHaveProperty('officeHours')
    expect(CHURCH_INFO).toHaveProperty('youtube')
    expect(CHURCH_INFO).toHaveProperty('instagram')
  })

  it('name is "GPIB Damai Sejahtera"', () => {
    expect(CHURCH_INFO.name).toBe('GPIB Damai Sejahtera')
  })

  it('email is valid format', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    expect(emailRegex.test(CHURCH_INFO.email)).toBe(true)
  })

  it('youtube is a valid URL', () => {
    expect(() => new URL(CHURCH_INFO.youtube)).not.toThrow()
    expect(CHURCH_INFO.youtube).toContain('youtube.com')
  })

  it('instagram is a valid URL', () => {
    expect(() => new URL(CHURCH_INFO.instagram)).not.toThrow()
    expect(CHURCH_INFO.instagram).toContain('instagram.com')
  })

  it('all string fields are non-empty', () => {
    const requiredFields = ['name', 'tagline', 'address', 'phone', 'email', 'officeHours'] as const
    for (const field of requiredFields) {
      expect(CHURCH_INFO[field].length).toBeGreaterThan(0)
    }
  })
})

describe('NAV_LINKS', () => {
  it('has exactly 5 navigation links', () => {
    expect(NAV_LINKS).toHaveLength(5)
  })

  it('contains Beranda, Jadwal, Unduhan, Dokumentasi, Kontak', () => {
    const labels = NAV_LINKS.map((l) => l.label)
    expect(labels).toContain('Beranda')
    expect(labels).toContain('Jadwal')
    expect(labels).toContain('Unduhan')
    expect(labels).toContain('Dokumentasi')
    expect(labels).toContain('Kontak')
  })

  it('all hrefs start with /', () => {
    for (const link of NAV_LINKS) {
      expect(link.href.startsWith('/')).toBe(true)
    }
  })

  it('Beranda href is /', () => {
    const beranda = NAV_LINKS.find((l) => l.label === 'Beranda')
    expect(beranda?.href).toBe('/')
  })

  it('each link has label and href', () => {
    for (const link of NAV_LINKS) {
      expect(link.label).toBeTruthy()
      expect(link.href).toBeTruthy()
    }
  })
})

describe('PELKAT_SINGKATAN', () => {
  it('contains exactly PA, PT, GP, PKP, PKB, PKLU', () => {
    expect(PELKAT_SINGKATAN).toHaveLength(6)
    expect(PELKAT_SINGKATAN).toContain('PA')
    expect(PELKAT_SINGKATAN).toContain('PT')
    expect(PELKAT_SINGKATAN).toContain('GP')
    expect(PELKAT_SINGKATAN).toContain('PKP')
    expect(PELKAT_SINGKATAN).toContain('PKB')
    expect(PELKAT_SINGKATAN).toContain('PKLU')
  })

  it('has no duplicates', () => {
    const unique = new Set(PELKAT_SINGKATAN)
    expect(unique.size).toBe(PELKAT_SINGKATAN.length)
  })
})
