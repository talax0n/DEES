-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'EDITOR', 'MULTIMEDIA_ADMIN', 'MULTIMEDIA_MEMBER');

-- AlterTable: drop old role column, add new roles array column
ALTER TABLE "users" DROP COLUMN "role";
ALTER TABLE "users" ADD COLUMN "roles" "UserRole"[] NOT NULL DEFAULT ARRAY[]::"UserRole"[];

-- AddForeignKey
ALTER TABLE "multimedia_members" ADD CONSTRAINT "multimedia_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- DropEnum
DROP TYPE "Role";
