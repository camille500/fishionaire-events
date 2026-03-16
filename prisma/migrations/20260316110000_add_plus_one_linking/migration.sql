-- AlterTable: Add self-referential plus-one linking
ALTER TABLE "event_invitations" ADD COLUMN "invited_by_id" INTEGER;

-- AddForeignKey
ALTER TABLE "event_invitations" ADD CONSTRAINT "event_invitations_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "event_invitations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
