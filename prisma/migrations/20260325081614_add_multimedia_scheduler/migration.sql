-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('DRAFT', 'COLLECTING', 'GENERATING', 'REVIEW', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "MultimediaRole" AS ENUM ('SLD', 'SND', 'STR', 'CAM');

-- CreateEnum
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'MAYBE');

-- CreateTable
CREATE TABLE "multimedia_members" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "nama" TEXT NOT NULL,
    "phone" TEXT,
    "roles" "MultimediaRole"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "multimedia_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_periods" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'DRAFT',
    "deadlineAvailability" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,

    CONSTRAINT "schedule_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_events" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "namaEvent" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "waktu" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "keterangan" TEXT,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "requiredRoles" "MultimediaRole"[],
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "schedule_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_availability" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "member_availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_assignments" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" "MultimediaRole" NOT NULL,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "multimedia_members_userId_key" ON "multimedia_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_periods_bulan_tahun_key" ON "schedule_periods"("bulan", "tahun");

-- CreateIndex
CREATE UNIQUE INDEX "member_availability_memberId_eventId_key" ON "member_availability"("memberId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_assignments_eventId_memberId_key" ON "schedule_assignments"("eventId", "memberId");

-- AddForeignKey
ALTER TABLE "schedule_events" ADD CONSTRAINT "schedule_events_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "schedule_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_availability" ADD CONSTRAINT "member_availability_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "multimedia_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_availability" ADD CONSTRAINT "member_availability_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "schedule_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_assignments" ADD CONSTRAINT "schedule_assignments_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "schedule_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_assignments" ADD CONSTRAINT "schedule_assignments_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "multimedia_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
