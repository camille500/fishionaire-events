-- AlterTable
ALTER TABLE "events" ADD COLUMN     "budget_currency" TEXT NOT NULL DEFAULT 'EUR',
ADD COLUMN     "budget_target_cents" INTEGER;

-- CreateTable
CREATE TABLE "budget_entries" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "category" TEXT NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "budget_entries_event_id_category_idx" ON "budget_entries"("event_id", "category");

-- AddForeignKey
ALTER TABLE "budget_entries" ADD CONSTRAINT "budget_entries_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
