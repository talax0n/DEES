export interface KegiatanItem {
  nama: string;
  waktu: string;
  lokasi?: string;
}

export interface JadwalHariItem {
  hari: string;
  kegiatan: KegiatanItem[];
}

// TODO: Connect to database/admin CRUD in future phase
export const jadwalSepekan: JadwalHariItem[] = [
  { hari: "Senin", kegiatan: [] },
  { hari: "Selasa", kegiatan: [] },
  { hari: "Rabu", kegiatan: [{ nama: "Ibadah Keluarga Sektoral", waktu: "19.30 WIB", lokasi: "Gedung Gereja" }] },
  { hari: "Kamis", kegiatan: [] },
  { hari: "Jumat", kegiatan: [{ nama: "Pendalaman Alkitab", waktu: "18.00 WIB" }] },
  { hari: "Sabtu", kegiatan: [
    { nama: "Pelayanan Anak / Persekutuan Teruna", waktu: "15.00 WIB" },
    { nama: "Gerakan Pemuda", waktu: "17.00 WIB" },
  ]},
  { hari: "Minggu", kegiatan: [
    { nama: "Ibadah Pagi Sesi I", waktu: "06.00 WIB", lokasi: "Gedung Gereja" },
    { nama: "Ibadah Pagi Sesi II", waktu: "09.00 WIB", lokasi: "Gedung Gereja" },
  ]},
];

export const dayStyles: Record<string, { pill: string; text: string }> = {
  Senin:   { pill: "bg-blue-50",   text: "text-blue-700" },
  Selasa:  { pill: "bg-purple-50", text: "text-purple-700" },
  Rabu:    { pill: "bg-green-50",  text: "text-green-700" },
  Kamis:   { pill: "bg-orange-50", text: "text-orange-700" },
  Jumat:   { pill: "bg-red-50",    text: "text-red-700" },
  Sabtu:   { pill: "bg-yellow-50", text: "text-yellow-700" },
  Minggu:  { pill: "bg-navy",      text: "text-white" },
};
