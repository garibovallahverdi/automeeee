import prisma from "../config/db";
import { scheduleBidJob } from "../utils/queues";
// import { scheduleBidJob } from "../utils/queues";

export class BidService {



  async  placeBid(userId: string, auctionId: string, bidAmount: number) {
    // Check if the user is a participant in the auction
    const participant = await prisma.participant.findUnique({
      where: {
        userId_auctionId: {
          userId,
          auctionId,
        },
      },
      select: {
        bidCount: true, 
      },
    });
  
    if (!participant) {
      throw new Error('User is not a participant in this auction');
    }
  
    if (participant.bidCount <= 0) {
      throw new Error('Your bid count is exhausted. Please make a payment to place more bids.');
    }

    const auction  = await prisma.auction.findUnique({
      where: { id: auctionId },
    })
     if(auction && bidAmount < auction?.startPrice) {
          throw new Error("The bid offer should be higher then auction start price")
     }
    const highestBid = await prisma.bid.findFirst({
      where: { auctionId },
      orderBy: { amount: 'desc' },
      select: { amount: true, userId: true },
    });
  
    if (highestBid) {
      if (bidAmount <= highestBid.amount) {
        throw new Error('Bid amount must be higher than the current highest bid');
      }
  
      if (highestBid.userId === userId) {
        throw new Error('You cannot place consecutive bids on your own highest bid');
      }
    }
  
    const bid = await prisma.bid.create({
      data: {
        amount: bidAmount,
        userId,
        auctionId,
      },
    });
  
    await prisma.participant.update({
      where: {
        userId_auctionId: {
          userId,
          auctionId,
        },
      },
      data: {
        bidCount: { decrement: 1 },
      },
    });
  
    await prisma.auction.update({
      where: { id: auctionId },
      data: { bidCounts: { increment: 1 } },
    });

    
    await scheduleBidJob(auction, bid,userId);
    console.log("Teklif edildi");

    return bid;
  }
  
}
