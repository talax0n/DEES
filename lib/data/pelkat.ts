

export interface PelkatItem {
  id: string;
  singkatan: string;
  nama: string;
  targetGroup: string;
  deskripsi: string;
  icon?: string;
  jadwal?: string;
  kontakPerson?: string;
}

export const pelkat: PelkatItem[] = [
  { id: "1", singkatan: "PA",   nama: "Pelayanan Anak",               targetGroup: "0–12 tahun",    deskripsi: "Pelayanan bagi anak-anak jemaat melalui cerita Alkitab, lagu rohani, dan kegiatan kreatif.",   icon: "/PK/PA.png" },
  { id: "2", singkatan: "PT",   nama: "Persekutuan Teruna",           targetGroup: "12–17 tahun",   deskripsi: "Persekutuan remaja gereja untuk pembentukan karakter dan iman di masa pertumbuhan.",             icon: "/PK/PT.png" },
  { id: "3", singkatan: "GP",   nama: "Gerakan Pemuda",               targetGroup: "17–35 tahun",   deskripsi: "Komunitas pemuda aktif yang melayani, bertumbuh bersama, dan menjadi garam dan terang dunia.",  icon: "/PK/GP.png" },
  { id: "4", singkatan: "PKP",  nama: "Persekutuan Kaum Perempuan",  targetGroup: "Perempuan dewasa", deskripsi: "Persekutuan ibu-ibu dan kaum perempuan dalam doa, pelayanan, dan pendalaman Firman Tuhan.",   icon: "/PK/PKP.png" },
  { id: "5", singkatan: "PKB",  nama: "Persekutuan Kaum Bapak",      targetGroup: "Bapak-bapak",   deskripsi: "Persekutuan kaum bapak dalam iman, kepemimpinan keluarga, dan pelayanan jemaat.",               icon: "/PK/PKB.png" },
  { id: "6", singkatan: "PKLU", nama: "Persekutuan Kaum Lanjut Usia", targetGroup: "60+ tahun",    deskripsi: "Persekutuan yang menghormati dan merawat warga jemaat lanjut usia dengan kasih dan perhatian.", icon: "/PK/PKLU.png" },
]
