-- AlterTable: Add plusOnes to invitation_sub_events
ALTER TABLE "invitation_sub_events" ADD COLUMN "plus_ones" INTEGER NOT NULL DEFAULT 0;
