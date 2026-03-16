-- CreateEnum
CREATE TYPE "date_poll_vote_status" AS ENUM ('yes', 'maybe', 'no');

-- CreateTable
CREATE TABLE "date_polls" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "date_polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "date_poll_options" (
    "id" SERIAL NOT NULL,
    "date_poll_id" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "start_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "date_poll_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "date_poll_votes" (
    "id" SERIAL NOT NULL,
    "date_poll_option_id" INTEGER NOT NULL,
    "voter_email" TEXT NOT NULL,
    "voter_name" TEXT,
    "status" "date_poll_vote_status" NOT NULL DEFAULT 'yes',
    "token" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "date_poll_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "date_polls_event_id_key" ON "date_polls"("event_id");

-- CreateIndex
CREATE UNIQUE INDEX "date_poll_votes_date_poll_option_id_voter_email_key" ON "date_poll_votes"("date_poll_option_id", "voter_email");

-- AddForeignKey
ALTER TABLE "date_polls" ADD CONSTRAINT "date_polls_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "date_poll_options" ADD CONSTRAINT "date_poll_options_date_poll_id_fkey" FOREIGN KEY ("date_poll_id") REFERENCES "date_polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "date_poll_votes" ADD CONSTRAINT "date_poll_votes_date_poll_option_id_fkey" FOREIGN KEY ("date_poll_option_id") REFERENCES "date_poll_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
