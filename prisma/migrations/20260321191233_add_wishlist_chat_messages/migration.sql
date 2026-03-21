-- CreateTable
CREATE TABLE "wishlist_item_messages" (
    "id" SERIAL NOT NULL,
    "wishlist_item_id" INTEGER NOT NULL,
    "guest_email" TEXT NOT NULL,
    "guest_name" TEXT,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_item_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "wishlist_item_messages_wishlist_item_id_created_at_idx" ON "wishlist_item_messages"("wishlist_item_id", "created_at");

-- AddForeignKey
ALTER TABLE "wishlist_item_messages" ADD CONSTRAINT "wishlist_item_messages_wishlist_item_id_fkey" FOREIGN KEY ("wishlist_item_id") REFERENCES "wishlist_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
