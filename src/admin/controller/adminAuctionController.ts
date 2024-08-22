import { NextFunction, Request, Response } from "express";
import prisma from "../../config/db";



export const getAllWaitingAuctions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const waitingAuctions = await prisma.auction.findMany({
        where: {
          adminAccept: false,
          status: 'scheduled'
        },
        include: {
          owner: true,  
          carDetail: true,  
        },
      });
  
      res.status(200).json({
        success: true,
        data: waitingAuctions,
      });
    } catch (error) {
      next(error);
    }
  };




  export const updateAuctionStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { action, rejectionReason } = req.body;  // rejectionReason: reject sırasında verilen sebep
  
    try {
      // Belirli auction'u bul
      const auction = await prisma.auction.findUnique({
        where: { id },
      });
  
      if (!auction) {
        return res.status(404).json({
          success: false,
          message: 'Auction not found',
        });
      }
  
      let updatedAuction;
  
      if (action === 'accept') {
        updatedAuction = await prisma.auction.update({
          where: { id },
          data: {
            adminAccept: true,
            status: 'active',
            rejectionReason: null,  
          },
        });
      } else if (action === 'reject') {
        updatedAuction = await prisma.auction.update({
          where: { id },
          data: {
            adminAccept: false,
            status: 'completed',
            rejectionReason: rejectionReason || 'No reason provided'
          },
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid action. Use "accept" or "reject".',
        });
      }
  
      res.status(200).json({
        success: true,
        data: updatedAuction,
      });
    } catch (error) {
      next(error);
    }
  };