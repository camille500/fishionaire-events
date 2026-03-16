-- AlterTable: Remove maxGuests from events
ALTER TABLE "events" DROP COLUMN IF EXISTS "max_guests";

-- AlterTable: Add shareToken to events
ALTER TABLE "events" ADD COLUMN "share_token" TEXT;
CREATE UNIQUE INDEX "events_share_token_key" ON "events"("share_token");

-- AlterTable: Add new fields to event_invitations
ALTER TABLE "event_invitations" ADD COLUMN "invitee_name" TEXT;
ALTER TABLE "event_invitations" ADD COLUMN "plus_ones" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "event_invitations" ADD COLUMN "access_token" TEXT;

-- Generate access tokens for existing invitations (if any)
UPDATE "event_invitations" SET "access_token" = gen_random_uuid()::text WHERE "access_token" IS NULL;

-- Make access_token required and unique
ALTER TABLE "event_invitations" ALTER COLUMN "access_token" SET NOT NULL;
CREATE UNIQUE INDEX "event_invitations_access_token_key" ON "event_invitations"("access_token");

-- CreateTable: InvitationSubEvent (join table)
CREATE TABLE "invitation_sub_events" (
    "id" SERIAL NOT NULL,
    "invitation_id" INTEGER NOT NULL,
    "sub_event_id" INTEGER NOT NULL,

    CONSTRAINT "invitation_sub_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "invitation_sub_events_invitation_id_sub_event_id_key" ON "invitation_sub_events"("invitation_id", "sub_event_id");

-- AddForeignKey
ALTER TABLE "invitation_sub_events" ADD CONSTRAINT "invitation_sub_events_invitation_id_fkey" FOREIGN KEY ("invitation_id") REFERENCES "event_invitations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invitation_sub_events" ADD CONSTRAINT "invitation_sub_events_sub_event_id_fkey" FOREIGN KEY ("sub_event_id") REFERENCES "sub_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
