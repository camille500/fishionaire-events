-- CreateTable
CREATE TABLE "onboarding_states" (
    "id" SERIAL NOT NULL,
    "user_clerk_id" TEXT NOT NULL,
    "dashboard_tour_done" BOOLEAN NOT NULL DEFAULT false,
    "event_creation_tour_done" BOOLEAN NOT NULL DEFAULT false,
    "dismissed_tooltips" JSONB NOT NULL DEFAULT '{}',
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboarding_states_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_states_user_clerk_id_key" ON "onboarding_states"("user_clerk_id");

-- AddForeignKey
ALTER TABLE "onboarding_states" ADD CONSTRAINT "onboarding_states_user_clerk_id_fkey" FOREIGN KEY ("user_clerk_id") REFERENCES "users"("clerk_id") ON DELETE CASCADE ON UPDATE CASCADE;
