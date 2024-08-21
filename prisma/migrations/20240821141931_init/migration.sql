/*
  Warnings:

  - Added the required column `vinCode` to the `CarDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CarDetail" ADD COLUMN     "vinCode" TEXT NOT NULL;
