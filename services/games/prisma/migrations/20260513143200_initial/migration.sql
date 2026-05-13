-- CreateTable
CREATE TABLE "rounds" (
    "id" VARCHAR(26) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "crash_point" DECIMAL(10,2),
    "seed" VARCHAR(255) NOT NULL,
    "hash" VARCHAR(255) NOT NULL,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rounds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bets" (
    "id" VARCHAR(26) NOT NULL,
    "round_id" VARCHAR(26) NOT NULL,
    "keycloak_id" VARCHAR(255) NOT NULL,
    "amount" BIGINT NOT NULL,
    "cashout_multiplier" DECIMAL(10,2),
    "status" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bets_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bets" ADD CONSTRAINT "bets_round_id_fkey" FOREIGN KEY ("round_id") REFERENCES "rounds"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
