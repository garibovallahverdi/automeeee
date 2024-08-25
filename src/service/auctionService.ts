import prisma from "../config/db";
import { DateTime } from 'luxon';
// import {  scheduleAuctionJobs } from "../utils/queues";

type CarDetailFilter = {
	manufacturer: string;
	model: string;
	minMileage: string;
	maxMileage: string;
	minYear: string;
	maxYear: string;
	color: string;
	page: string,
	limit: string
};

class AuctionService {
	async getNextLotNumber(): Promise<number> {
		const auctions = await prisma.auction.findMany({
			orderBy: {
				lotNumber: "asc",
			},
		});

		let expectedLotNumber = 1;
		for (const auction of auctions) {
			if (auction.lotNumber !== expectedLotNumber) {
				return expectedLotNumber;
			}
			expectedLotNumber++;
		}

		return expectedLotNumber;
	}

	async createAuctionWithCarDetails(data: {
		lotName: string;
		ownerId: string; 
		ownerName: string;
		location: string;
		startPrice: number;
		interval?: number;
		status: "scheduled" | "active" | "completed" | "reject";
		detailsText: string;
		carDetail: {
		  manufacturer: string;
		  brand: string; 
		  model: string;
		  year: string;
		  vinCode:string;
		  vehicleType: string;
		  color: string;
		  mileage: string;
		  engineCapacity: string;
		  carSegments: string;
		  driveType: string;
		  engine: string;
		  transmission: string;
		  fuelType: string;
		  insurancePolicy:string
		  brakeSystem: string;
		  frontImage : string;
		  backImage : string;
		  insideImage : string;
		  othersImage : string[];
		};
	  }) {
		const {
		  lotName,
		  ownerId,
		  ownerName,
		  location,
		  startPrice,
		  interval,
		  status,
		  detailsText,
		  carDetail,
		} = data;
	  
	    
		
	  
		const lotNumber = await this.getNextLotNumber();
		const slug = `${lotName.toLowerCase().replace(/\s+/g, "-")}-${lotNumber}`;
	  
		const createdAuction = await prisma.auction.create({
		  data: {
			lotName,
			ownerId,
			ownerName,
			location,
			startPrice,
			interval: interval || 0,
			status,
			detailsText,
			lotNumber,
			slug,
			carDetail: {
			  create: {
				manufacturer: carDetail.manufacturer,
				brand: carDetail.brand,
				model: carDetail.model,
				year: carDetail.year,
				vinCode:carDetail.vinCode,
				vehicleType: carDetail.vehicleType,
				color: carDetail.color,
				mileage: carDetail.mileage,
				engineCapacity: carDetail.engineCapacity,
				carSegments: carDetail.carSegments,
				driveType: carDetail.driveType,
				engine: carDetail.engine,
				transmission: carDetail.transmission,
				fuelType: carDetail.fuelType,
				brakeSystem: carDetail.brakeSystem,
				insurancePolicy:carDetail.insurancePolicy || null,
				frontImage : carDetail.frontImage,
		  		backImage : carDetail.backImage,
		  		insideImage : carDetail.insideImage,
		  		othersImage : carDetail.othersImage
			  },
			},
		  },
		});

	
	    //   await scheduleAuctionJobs(createdAuction);

		return createdAuction;
	  }
	  
	  async updateAuctionWithCarDetails(
		auctionId: string, 
		data: {
			lotName?: string;
			location?: string;
			startPrice?: number;
			interval?: number;
			status?: "scheduled" | "active" | "completed" | "reject";
			detailsText?: string;
			carDetail?: {
				manufacturer?: string;
				brand?: string;
				model?: string;
				year?: string;
				vinCode?: string;
				vehicleType?: string;
				color?: string;
				mileage?: string;
				engineCapacity?: string;
				carSegments?: string;
				driveType?: string;
				engine?: string;
				transmission?: string;
				fuelType?: string;
				insurancePolicy?: string;
				brakeSystem?: string;
				frontImage?: string;
				backImage?: string;
				insideImage?: string;
				othersImage?: string[];
			};
		}, 
		user: any 
	) {
		const auction = await prisma.auction.findUnique({
			where: { id: auctionId },
			include:{carDetail:true}
		});
	
		if (!auction) {
			throw new Error("Auction not found.");
		}
	
		if (auction.ownerId !== user.id) {
			throw new Error("You are not authorized to update this auction.");
		}
	
		const updatedAuction = await prisma.auction.update({
			where: { id: auctionId },
			data: {
				lotName: data.lotName || auction.lotName,
				location: data.location || auction.location,
				startPrice: data.startPrice || auction.startPrice,
				interval: data.interval !== undefined ? data.interval : auction.interval,
				status: "scheduled",
				rejectionReason:null,
				detailsText: data.detailsText || auction.detailsText,
				carDetail: {
					update: {
						manufacturer: data.carDetail?.manufacturer || auction.carDetail?.manufacturer,
						brand: data.carDetail?.brand || auction.carDetail?.brand,
						model: data.carDetail?.model || auction.carDetail?.model,
						year: data.carDetail?.year || auction.carDetail?.year,
						vinCode: data.carDetail?.vinCode || auction.carDetail?.vinCode,
						vehicleType: data.carDetail?.vehicleType || auction.carDetail?.vehicleType,
						color: data.carDetail?.color || auction.carDetail?.color,
						mileage: data.carDetail?.mileage || auction.carDetail?.mileage,
						engineCapacity: data.carDetail?.engineCapacity || auction.carDetail?.engineCapacity,
						carSegments: data.carDetail?.carSegments || auction.carDetail?.carSegments,
						driveType: data.carDetail?.driveType || auction.carDetail?.driveType,
						engine: data.carDetail?.engine || auction.carDetail?.engine,
						transmission: data.carDetail?.transmission || auction.carDetail?.transmission,
						fuelType: data.carDetail?.fuelType || auction.carDetail?.fuelType,
						insurancePolicy: data.carDetail?.insurancePolicy || auction.carDetail?.insurancePolicy,
						brakeSystem: data.carDetail?.brakeSystem || auction.carDetail?.brakeSystem,
						frontImage: data.carDetail?.frontImage || auction.carDetail?.frontImage,
						backImage: data.carDetail?.backImage || auction.carDetail?.backImage,
						insideImage: data.carDetail?.insideImage || auction.carDetail?.insideImage,
						othersImage: data.carDetail?.othersImage || auction.carDetail?.othersImage,
					},
				},
			},
		});
	
		return updatedAuction;
	}
	
	


	async addBidderToAuction(userId: string, auctionId: string) {
		const auction = await prisma.auction.findUnique({
			where: {
				id: auctionId,
			},
			select: {
				ownerId: true,
				status: true,
			},
		});

		if (!auction) {
			throw new Error("Auction not found");
		}

		if (auction.ownerId === userId) {
			throw new Error("Users cannot participate in their own auctions");
		}

		if (auction.status !== "active") {
			throw new Error("Auction is not active");
		}

		const existingParticipant = await prisma.participant.findUnique({
			where: {
				userId_auctionId: {
					userId,
					auctionId,
				},
			},
			include: { auctions: true },
		});

		if (existingParticipant) {
			throw new Error("User is already a participant in this auction");
		}

		const participant = await prisma.participant.create({
			data: {
				userId,
				auctionId,
				bidCount: 10,
			},
		});

		return participant;
	}

	async getAuctions(filter: CarDetailFilter) {
		const { manufacturer, model, minMileage, maxMileage, minYear, maxYear, color, page, limit } = filter;
		const take = +limit;
		const skip = (+page * +limit) - (+limit);

		return await prisma.auction.findMany({
			where: {
				carDetail: {
					manufacturer: {
						mode: 'insensitive',
						equals: manufacturer
					},
					model: {
						mode: 'insensitive',
						equals: model
					},
					mileage: {
						gt: minMileage,
						lt: maxMileage,
					},
					year: {
						gt: minYear,
						lt: maxYear,
					},
					color,
				},
			},
			orderBy: {
				createdAt: 'desc'
			},
			skip: skip,
			take: take
		});
	}

	async getAuctionById(id: string) {
		const auction = await prisma.auction.findUnique({
		  where: {
			id,
		  },
		  include: {
			carDetail: true,
		  },
		});
	  
		if (!auction) {
		  throw new Error(`Auction with ID ${id} not found`);
		}
	  
		return auction;
	  }

	  

	
}

export {CarDetailFilter, AuctionService};
