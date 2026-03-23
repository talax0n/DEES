export interface DokumentasiEvent {
  id: string
  namaAcara: string
  tanggal: string
  coverPhoto: string | null
  totalFoto: number
  photos: string[]
}

export const dokumentasi: DokumentasiEvent[] = [
  { id: "1", namaAcara: "Ibadah Natal 2025", tanggal: "2025-12-25", coverPhoto: null, totalFoto: 12, photos: [] },
  { id: "2", namaAcara: "Bakti Sosial Natal 2025", tanggal: "2025-12-10", coverPhoto: null, totalFoto: 8, photos: [] },
  { id: "3", namaAcara: "Retreat GP 2025", tanggal: "2025-12-05", coverPhoto: null, totalFoto: 24, photos: [] },
  { id: "4", namaAcara: "Penutupan Tahun Pelayanan 2025", tanggal: "2025-12-03", coverPhoto: null, totalFoto: 15, photos: [] },
  { id: "5", namaAcara: "HUT Gereja ke-30", tanggal: "2025-10-15", coverPhoto: null, totalFoto: 40, photos: [] },
]
