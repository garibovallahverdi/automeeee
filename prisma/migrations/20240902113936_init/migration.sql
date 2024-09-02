/*
  Warnings:

  - The `interval` column on the `Auction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `startPrice` on the `Auction` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Auction" DROP COLUMN "startPrice",
ADD COLUMN     "startPrice" INTEGER NOT NULL,
DROP COLUMN "interval",
ADD COLUMN     "interval" INTEGER;
