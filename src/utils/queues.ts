// import Bull from 'bull';
// import prisma from '../config/db';
// import Redis from 'ioredis';
// import { v4 as uuidv4 } from 'uuid';

// const auctionQueue = new Bull('auctionQueue', {
//   redis: { 
//     host: process.env.REDISHOST,
//     port: Number(process.env.REDISPORT),
//     password: process.env.REDISPASSWORD, 
//   },
// });

// const redisClient = new Redis({
//   host: process.env.REDISHOST,
//   port: Number(process.env.REDISPORT),
//   password: process.env.REDISPASSWORD,
// })

// // Auction başlangıç job'u
// auctionQueue.process('startAuction', async (job) => {
//   const { auctionId } = job.data;

//   try {
//     // Auction statusunu 'active' yap
//     await prisma.auction.update({
//       where: { id: auctionId },
//       data: { status: 'active' },
//     });

//     console.log(`Auction ${auctionId} has started and status updated to active.`);

//     // Auction sahibine bildirim gönder
//     const auction = await prisma.auction.findUnique({
//       where: { id: auctionId },
//       include: { owner: true, participants: true },
//     });

//     if (auction) {
//       const notificationId = uuidv4();
//       const notificationKey = `notification:${notificationId}`;

//       const ownerNotification = {
//         id: notificationId,
//         auctionId: auction.id,
//         userId: auction.ownerId,
//         message: `Your auction ${auction.lotName} is now active.`,
//         read: false,
//       };

//       // Bildirimi Redis'e ekle
//       await redisClient.set(notificationKey, JSON.stringify(ownerNotification));
//       await redisClient.expire(notificationKey, 3 * 24 * 60 * 60); // 3 gün sonra silinecek

//       // Auction katılımcılarına bildirim gönder
//       auction.participants.forEach(async (participant) => {
//         const participantNotificationId = uuidv4();
//         const participantNotificationKey = `notification:${participantNotificationId}`;

//         const participantNotification = {
//           id: participantNotificationId,
//           auctionId: auction.id,
//           userId: participant.userId,
//           message: `The auction ${auction.lotName} you are participating in is now active.`,
//           read: false,
//         };

//         await redisClient.set(participantNotificationKey, JSON.stringify(participantNotification));
//         await redisClient.expire(participantNotificationKey, 3 * 24 * 60 * 60); // 3 gün sonra silinecek
//       });
//     }
//   } catch (error) {
//     console.error(`Failed to update auction ${auctionId} to active: ${error}`);
//     throw new Error(`Failed to update auction ${auctionId} to active: ${error}`);
//   }
// });
// // Hiç teklif gelmezse auction'ı tamamlayan job
// auctionQueue.process('completeAuctionDueToNoBids', async (job) => {
//   const { auctionId } = job.data;

//   try {
//     // Auction statusunu 'completed' yap
//     await prisma.auction.update({
//       where: { id: auctionId },
//       data: { status: 'completed' },
//     });

//     console.log(`Auction ${auctionId} completed due to no bids.`);

//     // Auction sahibine bildirim gönder
//     const auction = await prisma.auction.findUnique({
//       where: { id: auctionId },
//       include: { owner: true },
//     });

//     if (auction) {
//       const notificationId = uuidv4();
//       const notificationKey = `notification:${notificationId}`;

//       const ownerNotification = {
//         id: notificationId,
//         auctionId: auction.id,
//         userId: auction.ownerId,
//         message: `Your auction ${auction.lotName} has been completed due to no bids within 3 days.`,
//         read: false,
//       };

//       // Bildirimi Redis'e ekle
//       await redisClient.set(notificationKey, JSON.stringify(ownerNotification));
//       await redisClient.expire(notificationKey, 3 * 24 * 60 * 60); // 3 gün sonra silinecek
//     }
//   } catch (error) {
//     console.error(`Failed to complete auction ${auctionId} due to no bids: ${error}`);
//     throw new Error(`Failed to complete auction ${auctionId} due to no bids: ${error}`);
//   }
// });



// // Teklif sonrası auction'ı tamamlayan job
// auctionQueue.process('completeAuctionAfterBid', async (job) => {
//   const { auctionId } = job.data;

//   try {
//     await prisma.auction.update({
//       where: { id: auctionId },
//       data: { status: 'completed' },
//     });
//     console.log(`Auction ${auctionId} completed after 3 hours since the last bid.`);
//   } catch (error) {
//     console.error(`Failed to update auction ${auctionId} to completed after bid: ${error}`);
//     throw new Error(`Failed to update auction ${auctionId} to completed after bid: ${error}`);
//   }
// });

// // Job tamamlandığında
// auctionQueue.on('completed', (job) => {
//   console.log(`Job ${job.id} for auction ${job.data.auctionId} completed successfully.`);
// });

// // Job başarısız olduğunda
// auctionQueue.on('failed', (job, error) => {
//   console.error(`Job ${job.id} for auction ${job.data.auctionId} failed: ${error}`);
// });

// // Auction start ve no bids job'larını ayarlayan fonksiyon
// export const scheduleAuctionJobs = async (auction: any) => {
//   console.log(`Scheduling jobs for auction ${auction.id}`);

//   await auctionQueue.add('startAuction', { auctionId: auction.id }, {
//     delay: new Date(auction.startTime).getTime() - Date.now(),
//   });
//   console.log(`Job scheduled to start auction ${auction.id} at ${auction.startTime}`);
  
//   const auctionEndDelay = new Date(auction.startTime).getTime() + 3 * 24 * 60 * 60 * 1000 - Date.now();

//   await auctionQueue.add('completeAuctionNoBids', { auctionId: auction.id }, {
//     delay: auctionEndDelay, 
//     jobId: `completeAuctionNoBids-${auction.id}`,
//   });
//   console.log(`Job scheduled to complete auction ${auction.id} if no bids are placed within 3 days.`);
// };

// // Teklif sonrası job'ı ayarlayan fonksiyon
// export const scheduleBidJob = async (auctionId: string) => {
//   console.log(`Scheduling bid job for auction ${auctionId}`);

//   const noBidsJob = await auctionQueue.getJob(`completeAuctionNoBids-${auctionId}`);
//   if (noBidsJob) {
//     await noBidsJob.remove();
//     console.log(`Removed no bids job for auction ${auctionId} after a bid was placed.`);
//   }

//   const oldBidJob = await auctionQueue.getJob(`completeAuctionAfterBid-${auctionId}`);
//   if (oldBidJob) {
//     await oldBidJob.remove();
//     console.log(`Removed old bid job for auction ${auctionId}`);
//   }

//   await auctionQueue.add('completeAuctionAfterBid', { auctionId }, {
//     delay: 3 * 60 * 60 * 1000,
//     jobId: `completeAuctionAfterBid-${auctionId}`,
//   });
//   console.log(`New job scheduled to complete auction ${auctionId} 3 hours after the last bid.`);
// };
