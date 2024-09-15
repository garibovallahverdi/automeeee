/*
  Warnings:

  - The `startTime` column on the `Auction` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Auction" DROP COLUMN "startTime",
ADD COLUMN     "startTime" TIMESTAMP(3);
