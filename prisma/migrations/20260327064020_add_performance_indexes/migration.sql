-- CreateIndex
CREATE INDEX "event_invitations_event_id_idx" ON "event_invitations"("event_id");

-- CreateIndex
CREATE INDEX "event_invitations_event_id_invitee_email_idx" ON "event_invitations"("event_id", "invitee_email");

-- CreateIndex
CREATE INDEX "sub_events_event_id_sort_order_idx" ON "sub_events"("event_id", "sort_order");
