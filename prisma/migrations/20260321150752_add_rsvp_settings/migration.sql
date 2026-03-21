-- AlterTable
ALTER TABLE "events" ADD COLUMN     "rsvp_deadline" TIMESTAMP(3),
ADD COLUMN     "rsvp_enabled" BOOLEAN NOT NULL DEFAULT true;
