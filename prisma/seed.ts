import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Seed JadwalIbadah
  await prisma.jadwalIbadah.createMany({
    data: [
      { namaIbadah: 'Ibadah Minggu Pagi I', hari: 'Minggu', waktu: '07.00 WIB', lokasi: 'Gedung Utama', metode: 'hybrid', linkStreaming: '' },
      { namaIbadah: 'Ibadah Minggu Pagi II', hari: 'Minggu', waktu: '09.30 WIB', lokasi: 'Gedung Utama', metode: 'hybrid', linkStreaming: '' },
      { namaIbadah: 'Ibadah Minggu Sore', hari: 'Minggu', waktu: '17.00 WIB', lokasi: 'Gedung Utama', metode: 'offline' },
    ],
    skipDuplicates: true,
  })

  // Seed PelayananKategorial
  await prisma.pelayananKategorial.createMany({
    data: [
      { nama: 'Pelayanan Anak', singkatan: 'PA', deskripsi: 'Pelayanan untuk anak-anak usia dini hingga SD.', jadwal: 'Setiap Minggu, 09.30 WIB', order: 1 },
      { nama: 'Persekutuan Teruna', singkatan: 'PT', deskripsi: 'Pelayanan untuk remaja SMP dan SMA.', jadwal: 'Setiap Sabtu, 16.00 WIB', order: 2 },
      { nama: 'Gerakan Pemuda', singkatan: 'GP', deskripsi: 'Pelayanan untuk pemuda dan mahasiswa.', jadwal: 'Setiap Sabtu, 17.00 WIB', order: 3 },
      { nama: 'Persekutuan Kaum Perempuan', singkatan: 'PKP', deskripsi: 'Persekutuan untuk kaum ibu dan perempuan.', jadwal: 'Setiap Rabu, 10.00 WIB', order: 4 },
      { nama: 'Persekutuan Kaum Bapak', singkatan: 'PKB', deskripsi: 'Persekutuan untuk kaum bapak.', jadwal: 'Setiap Kamis, 19.00 WIB', order: 5 },
      { nama: 'Persekutuan Kaum Lanjut Usia', singkatan: 'PKLU', deskripsi: 'Persekutuan untuk jemaat lanjut usia.', jadwal: 'Setiap Jumat, 10.00 WIB', order: 6 },
    ],
    skipDuplicates: true,
  })

  console.log('Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
