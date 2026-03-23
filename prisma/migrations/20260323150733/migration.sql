-- CreateTable
CREATE TABLE "jadwal_ibadah" (
    "id" TEXT NOT NULL,
    "namaIbadah" TEXT NOT NULL,
    "hari" TEXT NOT NULL,
    "waktu" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "metode" TEXT NOT NULL DEFAULT 'offline',
    "linkStreaming" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jadwal_ibadah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pelayanan_kategorial" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "singkatan" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,
    "jadwal" TEXT NOT NULL,
    "kontakPerson" TEXT,
    "iconUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "pelayanan_kategorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unduhan" (
    "id" TEXT NOT NULL,
    "judul" TEXT NOT NULL,
    "tipe" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unduhan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dokumentasi_event" (
    "id" TEXT NOT NULL,
    "namaAcara" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "coverPhoto" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dokumentasi_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dokumentasi_photo" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dokumentasi_photo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pelayanan_kategorial_singkatan_key" ON "pelayanan_kategorial"("singkatan");

-- AddForeignKey
ALTER TABLE "dokumentasi_photo" ADD CONSTRAINT "dokumentasi_photo_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "dokumentasi_event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
