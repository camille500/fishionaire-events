-- AlterTable
ALTER TABLE "events" ADD COLUMN     "guest_uploads_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "theme_color" TEXT;
