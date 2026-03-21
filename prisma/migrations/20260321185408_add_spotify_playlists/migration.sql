-- AlterTable
ALTER TABLE "sub_event_music_requests" ADD COLUMN     "playlist_id" INTEGER;

-- CreateTable
CREATE TABLE "spotify_playlists" (
    "id" SERIAL NOT NULL,
    "spotify_connection_id" INTEGER NOT NULL,
    "spotify_playlist_id" TEXT NOT NULL,
    "spotify_playlist_url" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spotify_playlists_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "sub_event_music_requests" ADD CONSTRAINT "sub_event_music_requests_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "spotify_playlists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spotify_playlists" ADD CONSTRAINT "spotify_playlists_spotify_connection_id_fkey" FOREIGN KEY ("spotify_connection_id") REFERENCES "spotify_connections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
