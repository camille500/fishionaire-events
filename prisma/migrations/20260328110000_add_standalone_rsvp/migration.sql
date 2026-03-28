-- AlterTable: Add mode and guestLimit to events
ALTER TABLE "events" ADD COLUMN "mode" TEXT NOT NULL DEFAULT 'event';
ALTER TABLE "events" ADD COLUMN "guest_limit" INTEGER;

-- AlterTable: Add partial attendance fields to date_poll_votes
ALTER TABLE "date_poll_votes" ADD COLUMN "attend_from" TIMESTAMP(3);
ALTER TABLE "date_poll_votes" ADD COLUMN "attend_until" TIMESTAMP(3);
