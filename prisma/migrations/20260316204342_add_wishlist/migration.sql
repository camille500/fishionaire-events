-- CreateTable
CREATE TABLE "wishlist_items" (
    "id" SERIAL NOT NULL,
    "event_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "image_key" TEXT,
    "external_url" TEXT,
    "external_product_id" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'manual',
    "price_cents" INTEGER,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "category" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_poolable" BOOLEAN NOT NULL DEFAULT false,
    "pool_target_cents" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wishlist_claims" (
    "id" SERIAL NOT NULL,
    "wishlist_item_id" INTEGER NOT NULL,
    "guest_email" TEXT NOT NULL,
    "guest_name" TEXT,
    "amount_cents" INTEGER,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'claimed',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_claims_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wishlist_claims_wishlist_item_id_guest_email_key" ON "wishlist_claims"("wishlist_item_id", "guest_email");

-- AddForeignKey
ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wishlist_claims" ADD CONSTRAINT "wishlist_claims_wishlist_item_id_fkey" FOREIGN KEY ("wishlist_item_id") REFERENCES "wishlist_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
