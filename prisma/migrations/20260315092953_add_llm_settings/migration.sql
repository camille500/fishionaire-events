-- AlterTable
ALTER TABLE "events" ADD COLUMN     "ai_extra_context" TEXT,
ADD COLUMN     "ai_tone" TEXT,
ADD COLUMN     "ai_tone_custom" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "ai_extra_context" TEXT,
ADD COLUMN     "ai_tone" TEXT,
ADD COLUMN     "ai_tone_custom" TEXT;
