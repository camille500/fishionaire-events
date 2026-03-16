-- CreateEnum
CREATE TYPE "sub_event_type" AS ENUM ('generic', 'ceremony', 'dinner', 'party', 'activity');

-- AlterTable
ALTER TABLE "sub_events" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "cover_image_key" TEXT,
ADD COLUMN     "cover_image_url" TEXT,
ADD COLUMN     "dress_code" TEXT,
ADD COLUMN     "rich_content" TEXT,
ADD COLUMN     "type" "sub_event_type" NOT NULL DEFAULT 'generic',
ADD COLUMN     "type_config" JSONB NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE "sub_event_dietaries" (
    "id" SERIAL NOT NULL,
    "sub_event_id" INTEGER NOT NULL,
    "guest_email" TEXT NOT NULL,
    "guest_name" TEXT,
    "restrictions" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_event_dietaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_event_plus_ones" (
    "id" SERIAL NOT NULL,
    "sub_event_id" INTEGER NOT NULL,
    "guest_email" TEXT NOT NULL,
    "plus_one_name" TEXT NOT NULL,
    "status" "sub_event_rsvp_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_event_plus_ones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_event_music_requests" (
    "id" SERIAL NOT NULL,
    "sub_event_id" INTEGER NOT NULL,
    "guest_email" TEXT NOT NULL,
    "song_title" TEXT NOT NULL,
    "artist" TEXT,
    "votes" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sub_event_music_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "sub_event_dietaries_sub_event_id_guest_email_key" ON "sub_event_dietaries"("sub_event_id", "guest_email");

-- AddForeignKey
ALTER TABLE "sub_event_dietaries" ADD CONSTRAINT "sub_event_dietaries_sub_event_id_fkey" FOREIGN KEY ("sub_event_id") REFERENCES "sub_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_event_plus_ones" ADD CONSTRAINT "sub_event_plus_ones_sub_event_id_fkey" FOREIGN KEY ("sub_event_id") REFERENCES "sub_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_event_music_requests" ADD CONSTRAINT "sub_event_music_requests_sub_event_id_fkey" FOREIGN KEY ("sub_event_id") REFERENCES "sub_events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
