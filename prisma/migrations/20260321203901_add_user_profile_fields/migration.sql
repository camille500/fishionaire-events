-- AlterTable
ALTER TABLE "users" ADD COLUMN     "avatar_key" TEXT,
ADD COLUMN     "avatar_url" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "display_name" TEXT,
ADD COLUMN     "profile_visible" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "social_instagram" TEXT,
ADD COLUMN     "social_linkedin" TEXT,
ADD COLUMN     "social_twitter" TEXT,
ADD COLUMN     "website" TEXT;
