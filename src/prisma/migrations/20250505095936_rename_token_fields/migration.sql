/*
  Warnings:

  - You are about to drop the column `refreshToken` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `token` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "refreshToken",
DROP COLUMN "token",
ADD COLUMN     "access_token" TEXT,
ADD COLUMN     "refresh_token" TEXT;
