-- CreateTable
CREATE TABLE "notifications" (
    "id" SERIAL NOT NULL,
    "user_clerk_id" TEXT NOT NULL,
    "event_id" INTEGER,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "link_url" TEXT,
    "metadata" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" SERIAL NOT NULL,
    "user_clerk_id" TEXT NOT NULL,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "reminder_schedule" JSONB NOT NULL DEFAULT '[]',
    "digest_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_reminders" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduled_reminders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_user_clerk_id_is_read_created_at_idx" ON "notifications"("user_clerk_id", "is_read", "created_at");

-- CreateIndex
CREATE INDEX "notifications_event_id_idx" ON "notifications"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_clerk_id_key" ON "notification_preferences"("user_clerk_id");

-- CreateIndex
CREATE INDEX "scheduled_reminders_scheduled_for_sent_at_idx" ON "scheduled_reminders"("scheduled_for", "sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "scheduled_reminders_event_id_type_scheduled_for_key" ON "scheduled_reminders"("event_id", "type", "scheduled_for");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_clerk_id_fkey" FOREIGN KEY ("user_clerk_id") REFERENCES "users"("clerk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_clerk_id_fkey" FOREIGN KEY ("user_clerk_id") REFERENCES "users"("clerk_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_reminders" ADD CONSTRAINT "scheduled_reminders_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
