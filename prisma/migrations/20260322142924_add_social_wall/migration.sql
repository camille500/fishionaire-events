-- CreateEnum
CREATE TYPE "social_wall_post_status" AS ENUM ('pending', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "social_wall_auto_approve" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "social_wall_posts" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "guest_email" TEXT NOT NULL,
    "guest_name" TEXT,
    "content" TEXT NOT NULL,
    "image_url" TEXT,
    "image_key" TEXT,
    "status" "social_wall_post_status" NOT NULL DEFAULT 'pending',
    "hearts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "social_wall_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "social_wall_posts_event_id_status_created_at_idx" ON "social_wall_posts"("event_id", "status", "created_at");

-- AddForeignKey
ALTER TABLE "social_wall_posts" ADD CONSTRAINT "social_wall_posts_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
