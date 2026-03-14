-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('user', 'admin');

-- CreateEnum
CREATE TYPE "subscription_tier" AS ENUM ('free', 'standard', 'pro');

-- CreateEnum
CREATE TYPE "subscription_status" AS ENUM ('active', 'past_due', 'canceled', 'incomplete');

-- CreateEnum
CREATE TYPE "event_tier" AS ENUM ('free', 'standard', 'pro');

-- CreateEnum
CREATE TYPE "event_type" AS ENUM ('birthday', 'wedding', 'baby_shower', 'dinner', 'corporate', 'other');

-- CreateEnum
CREATE TYPE "purchase_status" AS ENUM ('pending', 'completed', 'refunded', 'failed');

-- CreateEnum
CREATE TYPE "invitation_status" AS ENUM ('pending', 'accepted', 'declined');

-- CreateTable
CREATE TABLE "users" (
    "clerk_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "role" "user_role" NOT NULL DEFAULT 'user',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("clerk_id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" SERIAL NOT NULL,
    "user_clerk_id" TEXT NOT NULL,
    "tier" "subscription_tier" NOT NULL DEFAULT 'free',
    "status" "subscription_status" NOT NULL DEFAULT 'active',
    "stripe_customer_id" TEXT,
    "stripe_subscription_id" TEXT,
    "current_period_end" TIMESTAMP(3),
    "cancel_at_period_end" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "event_type" "event_type",
    "event_date" TIMESTAMP(3),
    "event_end_date" TIMESTAMP(3),
    "location" TEXT,
    "max_guests" INTEGER,
    "is_private" BOOLEAN NOT NULL DEFAULT true,
    "tier" "event_tier" NOT NULL DEFAULT 'free',
    "features" JSONB NOT NULL DEFAULT '{}',
    "owner_clerk_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_purchases" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "buyer_clerk_id" TEXT NOT NULL,
    "tier" "event_tier" NOT NULL,
    "status" "purchase_status" NOT NULL DEFAULT 'pending',
    "stripe_checkout_session_id" TEXT,
    "amount_cents" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_invitations" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "invitee_email" TEXT NOT NULL,
    "inviter_clerk_id" TEXT NOT NULL,
    "status" "invitation_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_user_clerk_id_key" ON "subscriptions"("user_clerk_id");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_user_clerk_id_fkey" FOREIGN KEY ("user_clerk_id") REFERENCES "users"("clerk_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_owner_clerk_id_fkey" FOREIGN KEY ("owner_clerk_id") REFERENCES "users"("clerk_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_purchases" ADD CONSTRAINT "event_purchases_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_purchases" ADD CONSTRAINT "event_purchases_buyer_clerk_id_fkey" FOREIGN KEY ("buyer_clerk_id") REFERENCES "users"("clerk_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_invitations" ADD CONSTRAINT "event_invitations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_invitations" ADD CONSTRAINT "event_invitations_inviter_clerk_id_fkey" FOREIGN KEY ("inviter_clerk_id") REFERENCES "users"("clerk_id") ON DELETE RESTRICT ON UPDATE CASCADE;
