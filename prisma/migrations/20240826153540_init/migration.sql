-- CreateTable
CREATE TABLE "Agreement" (
    "id" TEXT NOT NULL,
    "auctionId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "bidId" TEXT NOT NULL,
    "status" "AgreementStatus" NOT NULL DEFAULT 'pending',
    "buyerConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "sellerConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agreement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agreement_auctionId_key" ON "Agreement"("auctionId");

-- CreateIndex
CREATE UNIQUE INDEX "Agreement_bidId_key" ON "Agreement"("bidId");

-- CreateIndex
CREATE UNIQUE INDEX "Agreement_auctionId_buyerId_sellerId_bidId_key" ON "Agreement"("auctionId", "buyerId", "sellerId", "bidId");

-- AddForeignKey
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "Bid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
