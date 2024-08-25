import Bull from 'bull';
import prisma from '../config/db';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

const auctionQueue = new Bull('auctionQueue', {
  redis: { 
    host: process.env.REDISHOST,
    port: Number(process.env.REDISPORT),
    password: process.env.REDISPASSWORD, 
  },
});

const redisClient = new Redis({
  host: process.env.REDISHOST,
  port: Number(process.env.REDISPORT),
  password: process.env.REDISPASSWORD,
})

auctionQueue.process('startAuction', async (job) => {
  const { auctionId } = job.data;

  try {
    await prisma.auction.update({
      where: { id: auctionId },
      data: { status: 'active' },
    });

    console.log(`Auction ${auctionId} has started and status updated to active.`);


   
  } catch (error) {
    console.error(`Failed to update auction ${auctionId} to active: ${error}`);
    throw new Error(`Failed to update auction ${auctionId} to active: ${error}`);
  }
});
auctionQueue.process('completeAuctionNoBids', async (job) => {
  const { auctionId } = job.data;

  try {
    // Auction statusunu 'completed' yap
    await prisma.auction.update({
      where: { id: auctionId },
      data: { status: 'completed' },
    });

    console.log(`Auction ${auctionId} completed due to no bids.`);

    // Auction sahibine bildirim gönder
  
  } catch (error) {
    console.error(`Failed to complete auction ${auctionId} due to no bids: ${error}`);
    throw new Error(`Failed to complete auction ${auctionId} due to no bids: ${error}`);
  }
});



// Teklif sonrası auction'ı tamamlayan job
auctionQueue.process('completeAuctionAfterBid', async (job) => {
  const { auctionId } = job.data;

  try {
    await prisma.auction.update({
      where: { id: auctionId },
      data: { status: 'completed' },
    });
    console.log(`Auction ${auctionId} completed after 3 hours since the last bid.`);
  } catch (error) {
    console.error(`Failed to update auction ${auctionId} to completed after bid: ${error}`);
    throw new Error(`Failed to update auction ${auctionId} to completed after bid: ${error}`);
  }
});

// Job tamamlandığında
auctionQueue.on('completed', (job) => {
  console.log(`Job ${job.id} for auction ${job.data.auctionId} completed successfully.`);
});

// Job başarısız olduğunda
auctionQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} for auction ${job.data.auctionId} failed: ${error}`);
});

// Auction start ve no bids job'larını ayarlayan fonksiyon
export const scheduleAuctionJobs = async (auction: any) => {
  console.log(`Scheduling jobs for auction ${auction.id}`);

//   await auctionQueue.add('startAuction', { auctionId: auction.id }, {
//     delay: new Date(auction.startTime).getTime() - Date.now(),
//   });
  console.log(`Job scheduled to start auction ${auction.id} at ${auction.updatedAt}`);
  
  // const auctionEndDelay = new Date(auction.updatedAt).getTime() + 7 * 24 * 60 * 60 * 1000 - Date.now();
  const auctionEndDelay = new Date(auction.updatedAt).getTime() + 5 * 60 * 1000 - Date.now();

  await auctionQueue.add('completeAuctionNoBids', { auctionId: auction.id }, {
    delay: auctionEndDelay, 
    jobId: `completeAuctionNoBids-${auction.id}`,
  });
  console.log(`Job scheduled to complete auction ${auction.id} if no bids are placed within 3 days.`);
};

// Teklif sonrası job'ı ayarlayan fonksiyon
export const scheduleBidJob = async (auctionId: string) => {
  console.log(`Scheduling bid job for auction ${auctionId}`);

  const noBidsJob = await auctionQueue.getJob(`completeAuctionNoBids-${auctionId}`);
  if (noBidsJob) {
    await noBidsJob.remove();
    console.log(`Removed no bids job for auction ${auctionId} after a bid was placed.`);
  }

  const oldBidJob = await auctionQueue.getJob(`completeAuctionAfterBid-${auctionId}`);
  if (oldBidJob) {
    await oldBidJob.remove();
    console.log(`Removed old bid job for auction ${auctionId}`);
  }

  await auctionQueue.add('completeAuctionAfterBid', { auctionId }, {
    delay: 2  * 60 * 1000,
    jobId: `completeAuctionAfterBid-${auctionId}`,
  });
  console.log(`New job scheduled to complete auction ${auctionId} 3 hours after the last bid.`);
};
