-- CreateTable
CREATE TABLE "wallets" (
    "id" VARCHAR(26) NOT NULL,
    "keycloak_id" VARCHAR(255) NOT NULL,
    "balance" BIGINT NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wallets_keycloak_id_key" ON "wallets"("keycloak_id");
