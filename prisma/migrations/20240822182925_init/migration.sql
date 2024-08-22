-- CreateEnum
CREATE TYPE "LotStatus" AS ENUM ('scheduled', 'active', 'completed', 'reject');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'SUPERUSER', 'ADMIN');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('AUCTION_ACCEPTED', 'AUCTION_REJECTED', 'AUCTION_ENDED', 'YOU_ARE_WINNER');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('participant', 'winner');

-- CreateEnum
CREATE TYPE "AgreementStatus" AS ENUM ('pending', 'accepted', 'rejected');

-- CreateTable
CREATE TABLE "Auction" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "adminAccept" BOOLEAN NOT NULL DEFAULT false,
    "lotName" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "carDetailId" TEXT,
    "ownerName" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "startPrice" INTEGER NOT NULL,
    "interval" INTEGER,
    "status" "LotStatus" NOT NULL DEFAULT 'scheduled',
    "rejectionReason" TEXT,
    "detailsText" TEXT NOT NULL,
    "lotNumber" INTEGER NOT NULL,
    "bidCounts" INTEGER NOT NULL DEFAULT 0,
    "lotViews" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarDetail" (
    "id" TEXT NOT NULL,
    "manufacturer" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" TEXT NOT NULL,
    "vehicleType" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "mileage" TEXT NOT NULL,
    "engineCapacity" TEXT NOT NULL,
    "carSegments" TEXT NOT NULL,
    "driveType" TEXT NOT NULL,
    "engine" TEXT NOT NULL,
    "transmission" TEXT NOT NULL,
    "fuelType" TEXT NOT NULL,
    "vinCode" TEXT NOT NULL,
    "brakeSystem" TEXT NOT NULL,
    "insurancePolicy" TEXT,
    "frontImage" TEXT[],
    "backImage" TEXT[],
    "insideImage" TEXT[],
    "othersImage" TEXT[],
    "auctionId" TEXT NOT NULL,

    CONSTRAINT "CarDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "googleId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "location" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "verificationCode" TEXT,
    "verificationCodeExpiresAt" TIMESTAMP(3),
    "resetPassswordCode" TEXT,
    "resetPassCodeExpiresAt" TIMESTAMP(3),
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bid" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,

    CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Participant" (
    "userId" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'participant',
    "bidCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Participant_pkey" PRIMARY KEY ("userId","auctionId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Auction_slug_key" ON "Auction"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CarDetail_auctionId_key" ON "CarDetail"("auctionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Auction" ADD CONSTRAINT "Auction_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarDetail" ADD CONSTRAINT "CarDetail_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
