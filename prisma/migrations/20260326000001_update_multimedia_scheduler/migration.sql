-- Drop existing multimedia tables (cascade removes all FK dependencies)
DROP TABLE IF EXISTS "schedule_assignments" CASCADE;
DROP TABLE IF EXISTS "member_availability" CASCADE;
DROP TABLE IF EXISTS "schedule_events" CASCADE;
DROP TABLE IF EXISTS "schedule_periods" CASCADE;
DROP TABLE IF EXISTS "multimedia_members" CASCADE;
DROP TABLE IF EXISTS "app_settings" CASCADE;

-- Drop old enums
DROP TYPE IF EXISTS "MultimediaRole" CASCADE;
DROP TYPE IF EXISTS "MultimediaServiceRole" CASCADE;
DROP TYPE IF EXISTS "AvailabilityStatus" CASCADE;
DROP TYPE IF EXISTS "ScheduleStatus" CASCADE;

-- Remove multimediaMember relation column from users (userId on multimedia_members is gone)
-- Nothing to do on users table since the FK was on multimedia_members side

-- Create new enums
CREATE TYPE "ScheduleStatus" AS ENUM ('DRAFT', 'COLLECTING', 'CLOSED', 'REVIEW', 'PUBLISHED');
CREATE TYPE "MultimediaServiceRole" AS ENUM ('SLD', 'SND', 'STR', 'CAM');
CREATE TYPE "AvailabilityStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE');

-- Create multimedia_members
CREATE TABLE "multimedia_members" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "phone" TEXT,
    "serviceRoles" "MultimediaServiceRole"[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "multimedia_members_pkey" PRIMARY KEY ("id")
);

-- Create schedule_periods
CREATE TABLE "schedule_periods" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "status" "ScheduleStatus" NOT NULL DEFAULT 'DRAFT',
    "formToken" TEXT,
    "formEnabled" BOOLEAN NOT NULL DEFAULT false,
    "deadlineAvailability" TIMESTAMP(3),
    "publishedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "schedule_periods_pkey" PRIMARY KEY ("id")
);

-- Create schedule_events
CREATE TABLE "schedule_events" (
    "id" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "namaEvent" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "waktu" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "keterangan" TEXT,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "requiredRoles" "MultimediaServiceRole"[],
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "schedule_events_pkey" PRIMARY KEY ("id")
);

-- Create member_availability
CREATE TABLE "member_availability" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "status" "AvailabilityStatus" NOT NULL DEFAULT 'AVAILABLE',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "member_availability_pkey" PRIMARY KEY ("id")
);

-- Create schedule_assignments
CREATE TABLE "schedule_assignments" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "role" "MultimediaServiceRole" NOT NULL,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "schedule_assignments_pkey" PRIMARY KEY ("id")
);

-- Create app_settings
CREATE TABLE "app_settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("key")
);

-- Unique constraints
CREATE UNIQUE INDEX "schedule_periods_bulan_tahun_key" ON "schedule_periods"("bulan", "tahun");
CREATE UNIQUE INDEX "schedule_periods_formToken_key" ON "schedule_periods"("formToken");
CREATE UNIQUE INDEX "member_availability_memberId_eventId_key" ON "member_availability"("memberId", "eventId");
CREATE UNIQUE INDEX "schedule_assignments_eventId_memberId_key" ON "schedule_assignments"("eventId", "memberId");

-- Foreign keys
ALTER TABLE "schedule_events" ADD CONSTRAINT "schedule_events_periodId_fkey"
    FOREIGN KEY ("periodId") REFERENCES "schedule_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "member_availability" ADD CONSTRAINT "member_availability_memberId_fkey"
    FOREIGN KEY ("memberId") REFERENCES "multimedia_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "member_availability" ADD CONSTRAINT "member_availability_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "schedule_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "schedule_assignments" ADD CONSTRAINT "schedule_assignments_eventId_fkey"
    FOREIGN KEY ("eventId") REFERENCES "schedule_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "schedule_assignments" ADD CONSTRAINT "schedule_assignments_memberId_fkey"
    FOREIGN KEY ("memberId") REFERENCES "multimedia_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
