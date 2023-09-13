CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "collection_log" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "user_id" UUID NOT NULL,
    "unique_obtained" INTEGER DEFAULT 0,
    "unique_items" INTEGER DEFAULT 0,
    "total_obtained" INTEGER DEFAULT 0,
    "total_items" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "is_updating" BOOLEAN DEFAULT false,

    CONSTRAINT "collection_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_log_entry" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "collection_log_tab_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "collection_log_entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_log_item" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "collection_log_id" UUID NOT NULL,
    "collection_log_entry_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "item_id" INTEGER NOT NULL,
    "quantity" INTEGER DEFAULT 0,
    "obtained" BOOLEAN DEFAULT false,
    "sequence" INTEGER NOT NULL,
    "obtained_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "collection_log_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_log_kill_count" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "collection_log_id" UUID NOT NULL,
    "collection_log_entry_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "amount" INTEGER DEFAULT 0,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "sequence" INTEGER DEFAULT 0,

    CONSTRAINT "collection_log_kill_count_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_log_tab" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "collection_log_tab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "collection_log_user" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "username" VARCHAR(255) NOT NULL,
    "account_type" VARCHAR(255),
    "runelite_id" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "deleted_at" TIMESTAMPTZ(6),
    "is_female" BOOLEAN DEFAULT false,
    "account_hash" VARCHAR(255),
    "is_banned" BOOLEAN DEFAULT false,
    "show_quantity" BOOLEAN DEFAULT true,
    "display_rank" VARCHAR(255) DEFAULT 'ALL',

    CONSTRAINT "collection_log_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recent_obtained_items" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "username" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "item_id" INTEGER NOT NULL,
    "quantity" INTEGER DEFAULT 0,
    "obtained" BOOLEAN DEFAULT false,
    "obtained_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "recent_obtained_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "collection_log_item_collection_log_entry_id_collection_log_id_i" ON "collection_log_item"("collection_log_entry_id", "collection_log_id");

-- CreateIndex
CREATE INDEX "collection_log_item_collection_log_id_index" ON "collection_log_item"("collection_log_id");

-- CreateIndex
CREATE INDEX "collection_log_kill_count_collection_log_entry_id_collection_lo" ON "collection_log_kill_count"("collection_log_entry_id", "collection_log_id");

-- AddForeignKey
ALTER TABLE "collection_log" ADD CONSTRAINT "collection_log_user_id_foreign" FOREIGN KEY ("user_id") REFERENCES "collection_log_user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_log_entry" ADD CONSTRAINT "collection_log_entry_collection_log_tab_id_foreign" FOREIGN KEY ("collection_log_tab_id") REFERENCES "collection_log_tab"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_log_item" ADD CONSTRAINT "collection_log_item_collection_log_entry_id_foreign" FOREIGN KEY ("collection_log_entry_id") REFERENCES "collection_log_entry"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_log_item" ADD CONSTRAINT "collection_log_item_collection_log_id_foreign" FOREIGN KEY ("collection_log_id") REFERENCES "collection_log"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_log_kill_count" ADD CONSTRAINT "collection_log_kill_count_collection_log_entry_id_foreign" FOREIGN KEY ("collection_log_entry_id") REFERENCES "collection_log_entry"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "collection_log_kill_count" ADD CONSTRAINT "collection_log_kill_count_collection_log_id_foreign" FOREIGN KEY ("collection_log_id") REFERENCES "collection_log"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

