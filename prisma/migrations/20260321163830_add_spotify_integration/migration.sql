-- CreateEnum
CREATE TYPE "music_request_status" AS ENUM ('pending', 'approved', 'rejected', 'queued');

-- AlterTable
ALTER TABLE "sub_event_music_requests" ADD COLUMN     "album_art_url" TEXT,
ADD COLUMN     "duration_ms" INTEGER,
ADD COLUMN     "preview_url" TEXT,
ADD COLUMN     "spotify_track_id" TEXT,
ADD COLUMN     "spotify_uri" TEXT,
ADD COLUMN     "status" "music_request_status" NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE "spotify_connections" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "user_clerk_id" TEXT NOT NULL,
    "spotify_user_id" TEXT NOT NULL,
    "spotify_display_name" TEXT,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT NOT NULL,
    "token_expires_at" TIMESTAMP(3) NOT NULL,
    "playlist_id" TEXT,
    "playlist_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spotify_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "spotify_connections_event_id_key" ON "spotify_connections"("event_id");

-- AddForeignKey
ALTER TABLE "spotify_connections" ADD CONSTRAINT "spotify_connections_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spotify_connections" ADD CONSTRAINT "spotify_connections_user_clerk_id_fkey" FOREIGN KEY ("user_clerk_id") REFERENCES "users"("clerk_id") ON DELETE RESTRICT ON UPDATE CASCADE;
