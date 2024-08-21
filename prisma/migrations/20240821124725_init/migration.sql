-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- AlterTable
ALTER TABLE "Auction" ADD COLUMN     "adminAccept" BOOLEAN NOT NULL DEFAULT false;
