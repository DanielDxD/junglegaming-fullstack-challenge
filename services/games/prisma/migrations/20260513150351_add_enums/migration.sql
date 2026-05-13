/*
  Warnings:

  - Changed the type of `status` on the `bets` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `rounds` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "RoundStatus" AS ENUM ('PENDING', 'BETTING', 'ACTIVE', 'FINISHED');

-- CreateEnum
CREATE TYPE "BetStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'WON', 'LOST');

-- AlterTable
ALTER TABLE "bets" DROP COLUMN "status",
ADD COLUMN     "status" "BetStatus" NOT NULL;

-- AlterTable
ALTER TABLE "rounds" DROP COLUMN "status",
ADD COLUMN     "status" "RoundStatus" NOT NULL;
