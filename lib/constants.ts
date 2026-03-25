export const CHURCH_INFO = {
  name: 'GPIB Damai Sejahtera',
  tagline: 'Melayani dengan Kasih, Bertumbuh dalam Iman',
  address: 'Jl. Kampung Pasar Lama RT 01/01 No.27, Cileungsi, Kec. Cileungsi, Kabupaten Bogor, Jawa Barat 16820',
  phone: '(021) 22950224',
  email: 'info@gpibdamaisejahtera.org',
  officeHours: 'Senin–Jumat: 09.00–17.00 WIB',
  youtube: 'https://www.youtube.com/@GPIBDamaiSejahteraCileungsi',
  instagram: 'https://www.instagram.com/gpibdscileungsi',
  mapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966!2d106.8272!3d-6.2088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTInMzEuNyJTIDEwNsKwNDknMzguMSJF!5e0!3m2!1sid!2sid!4v1',
  mapsUrl: 'https://maps.google.com/?q=GPIB+Damai+Sejahtera+Jakarta+Selatan',
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
