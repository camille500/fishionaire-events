-- Add theme customization fields to events table
ALTER TABLE "events" ADD COLUMN "theme_color_secondary" TEXT;
ALTER TABLE "events" ADD COLUMN "gradient_angle" INTEGER NOT NULL DEFAULT 135;
ALTER TABLE "events" ADD COLUMN "font_pairing" TEXT;
ALTER TABLE "events" ADD COLUMN "card_style" TEXT NOT NULL DEFAULT 'glass';
ALTER TABLE "events" ADD COLUMN "welcome_message" TEXT;
ALTER TABLE "events" ADD COLUMN "hero_animation" TEXT NOT NULL DEFAULT 'fadeUp';
ALTER TABLE "events" ADD COLUMN "background_pattern" TEXT;
ALTER TABLE "events" ADD COLUMN "color_mode" TEXT NOT NULL DEFAULT 'auto';
ALTER TABLE "events" ADD COLUMN "custom_logo_url" TEXT;
ALTER TABLE "events" ADD COLUMN "custom_logo_key" TEXT;
ALTER TABLE "events" ADD COLUMN "hide_branding" BOOLEAN NOT NULL DEFAULT false;
