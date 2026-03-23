export const CHURCH_INFO = {
  name: 'GPIB Damai Sejahtera',
  tagline: 'Melayani dengan Kasih, Bertumbuh dalam Iman',
  address: 'Jl. Contoh No. 1, Jakarta Selatan, DKI Jakarta 12345',
  phone: '+62 21 1234 5678',
  email: 'info@gpibdamaisejahtera.org',
  officeHours: 'Senin–Jumat: 09.00–17.00 WIB',
  youtube: 'https://youtube.com/@gpibdamaisejahtera',
  instagram: 'https://instagram.com/gpibdamaisejahtera',
}

export const NAV_LINKS = [
  { label: 'Beranda', href: '/' },
  { label: 'Jadwal', href: '/jadwal' },
  { label: 'Unduhan', href: '/unduhan' },
  { label: 'Dokumentasi', href: '/dokumentasi' },
  { label: 'Kontak', href: '/kontak' },
]

export const PELKAT_SINGKATAN = ['PA', 'PT', 'GP', 'PKP', 'PKB', 'PKLU'] as const
export type PelkatSingkatan = (typeof PELKAT_SINGKATAN)[number]
