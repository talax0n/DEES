export interface JadwalIbadah {
  id: string
  namaIbadah: string
  hari: string
  waktu: string
  lokasi: string
  metode: 'online' | 'offline' | 'hybrid'
  linkStreaming?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PelayananKategorial {
  id: string
  nama: string
  singkatan: string
  deskripsi: string
  jadwal: string
  kontakPerson?: string
  iconUrl?: string
  order: number
}

export interface Unduhan {
  id: string
  judul: string
  tipe: 'TAIB' | 'WARTA'
  tanggal: Date
  fileUrl: string
  fileSize?: number
  createdAt: Date
  updatedAt: Date
}

export interface DokumentasiEvent {
  id: string
  namaAcara: string
  tanggal: Date
  coverPhoto?: string | null
  totalFoto?: number
  photos?: DokumentasiPhoto[]
  createdAt?: Date
  updatedAt?: Date
}

export interface DokumentasiPhoto {
  id: string
  eventId: string
  imageUrl: string
  caption?: string | null
  order: number
  createdAt?: Date
}

export interface ApiResponse<T> {
  data: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
