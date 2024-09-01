import { Request, Response } from "express";
import { AuctionService, CarDetailFilter } from "../service/auctionService";
import { NextFunction } from "express-serve-static-core";

class AuctionController {
	auctionService: AuctionService;

	constructor() {
		this.auctionService = new AuctionService();
	}

	async createAuction(req: Request, res: Response, next: NextFunction) {
		const user = req.user as any
        		
		try {
			// const auction = await this.auctionService.createAuctionWithCarDetails(req.body,user);

			console.log(req.headers);
			
			res.status(201).json(req.body);
		} catch (error) {
			next(error);
		}
	}

	async updateAuction(req: Request, res: Response, next: NextFunction) {
		try {
			const { auctionId } = req.params;
			const user = req.user; 
			const updatedAuction = await this.auctionService.updateAuctionWithCarDetails(auctionId, req.body, user);
			res.status(200).json(updatedAuction);
		} catch (error) {
			next(error);
		}
	}
	
	async addBidder(req: Request, res: Response, next: NextFunction) {
		try {
			const { userId, auctionId } = req.body;

			const participant = await this.auctionService.addBidderToAuction(userId, auctionId);

			res.status(201).json(participant);
		} catch (error) {
			next(error);
		}
	}

	async getAuctions(req: Request, res: Response,next:NextFunction) {
		try {
		  const filters = req.query; // Query parametrelerinden filtreleri alır
		  const auctions = await this.auctionService.getAuctions(filters);
	
		  res.status(200).json(auctions);
		} catch (error) {
		  res.status(500).json({ message: error });
		}
	  }
	
	  // Slug'a göre belirli bir Auction'ı getirir
	  async getAuctionBySlug(req: Request, res: Response,next:NextFunction) {
		try {
		  const { slug } = req.params;
		  const auction = await this.auctionService.getAuctionBySlug(slug);
	
		  res.status(200).json(auction);
		} catch (error) {
		  res.status(500).json({ message: error });
		}
	  }
	
}

export default AuctionController;
