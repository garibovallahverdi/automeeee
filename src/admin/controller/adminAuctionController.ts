import { NextFunction, Request, Response } from "express";
import prisma from "../../config/db";
import { NotificationType } from "@prisma/client";
import { scheduleAuctionJobs } from "../../utils/queues";



export const getAllWaitingAuctions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1; 
      const limit = parseInt(req.query.limit as string) || 5; 
      const skip = (page - 1) * limit;
  
      const waitingAuctions = await prisma.auction.findMany({
        where: {
          adminAccept: false,
          status: 'scheduled'
        },
        include: {
          owner: true,
          carDetail: true,
        },
        skip,
        take: limit,
      });
  
      const totalAuctions = await prisma.auction.count({
        where: {
          adminAccept: false,
          status: 'scheduled'
        }
      });
  
      const totalPages = Math.ceil(totalAuctions / limit);
  
      res.status(200).json({
        success: true,
        data: waitingAuctions,
        currentPage: page,
        totalPages,
        totalItems: totalAuctions,
        itemsPerPage: limit
      });
    } catch (error) {
      next(error);
    }
  };




  export const updateAuctionStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { action, rejectionReason } = req.body; 

    try {
        const auction = await prisma.auction.findUnique({
            where: { id },
            include: {
                owner: true, 
            },
        });

        if (!auction) {
            return res.status(404).json({
                success: false,
                message: 'Auction not found',
            });
        }

        let updatedAuction;
        let notificationType:NotificationType;
        let notificationMessage;

        if (action === 'accept') {
            updatedAuction = await prisma.auction.update({
                where: { id },
                data: {
                    adminAccept: true,
                    status: 'active',
                    rejectionReason: null,
                },
            });

            notificationType = NotificationType.AUCTION_ACCEPTED;
            notificationMessage = `Your auction "${auction.lotName}" has been accepted and is now active.`;
	        await scheduleAuctionJobs(updatedAuction);

        } else if (action === 'reject') {
            updatedAuction = await prisma.auction.update({
                where: { id },
                data: {
                    adminAccept: false,
                    status: 'completed',
                    rejectionReason: rejectionReason || 'No reason provided',
                    updatedAt:new Date()
                },
            });

            notificationType = NotificationType.AUCTION_REJECTED
            notificationMessage = `Your auction "${auction.lotName}" has been rejected. Reason: ${rejectionReason || 'No reason provided'}.`;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Use "accept" or "reject".',
            });
        }

        await prisma.notification.create({
            data: {
                userId: auction.ownerId, 
                auctionId: auction.id,
                type: notificationType,
                message: notificationMessage,
            },
        });


        res.status(200).json({
            success: true,
            data: updatedAuction,
        });
    } catch (error) {
        next(error);
    }
};