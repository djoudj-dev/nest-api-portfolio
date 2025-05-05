/*
  Warnings:

  - The `status` column on the `BadgeStatus` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "BadgeStatusType" AS ENUM ('available', 'available_from', 'unavailable');

-- CreateTable IF NOT EXISTS
CREATE TABLE IF NOT EXISTS "BadgeStatus" (
    "id" TEXT NOT NULL,
    "available_from" TIMESTAMP(3),
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BadgeStatus_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "BadgeStatus" DROP COLUMN IF EXISTS "status",
ADD COLUMN     "status" "BadgeStatusType"[];
