import { LotStatus } from "@prisma/client";
import prisma from "../config/db";
import { DateTime } from 'luxon';
// import {  scheduleAuctionJobs } from "../utils/queues";

type CarDetailFilter = {
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

	async createAuctionWithCarDetails(
		data: {
		  lotName: string;
		  ownerName: string;
		  location: string;
		  startPrice: number;
		  interval?: number;
		  status: "scheduled" | "active" | "completed" | "reject";
		  detailsText: string;
		  carDetail: {
			brand: string;
			model: string;
			year: string;
			vinCode: string;
			vehicleType: string;
			color: string;
			mileage: string;
			engineCapacity: string;
			carSegments: string;
			driveType: string;
			engine: string;
			transmission: string;
			fuelType: string;
			insurancePolicy: string;
			technicalDocument: string;
			brakeSystem: string;
			frontImage: string;
			backImage: string;
			insideImage: string;
			othersImage: string[];
		  };
		},
		user: any
	  ) {
		const {
		  lotName,
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
	  
		// Auction ve CarDetail'i tek bir işlemde oluşturun
		const createdAuction = await prisma.auction.create({
		  data: {
			lotName,
			ownerId: user.id,
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
				brand: carDetail.brand,
				model: carDetail.model,
				year: carDetail.year,
				vinCode: carDetail.vinCode,
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
				insurancePolicy: carDetail.insurancePolicy,
				technicalDocument: carDetail.technicalDocument,
				frontImage: carDetail.frontImage,
				backImage: carDetail.backImage,
				insideImage: carDetail.insideImage,
				othersImage: carDetail.othersImage,
			  },
			},
		  },
		  include: {
			carDetail: true, 
		  },
		});
	  
		return createdAuction;
	  }
	  
	  
//************************************* */
async updateAuctionWithCarDetails(
	auctionId: string,
	data: {
	  detailsText?: string;
	  location?: string;
	  lotName?: string;
	  carDetail?: {
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
		technicalDocument?: string;
		brakeSystem?: string;
		frontImage?: string;
		backImage?: string;
		insideImage?: string;
		othersImage?: string[];
	  };
	},
	user: any
  ) {
	const { detailsText, location, lotName, carDetail } = data;
  
	// Mevcut müzayede bilgilerini alın
	const existingAuction = await this.getAuctionById(auctionId);
  
	// lotName varsa slug'ı güncelleyin, yoksa slug ve lotName'i dokunmadan geçin
	const slug = lotName
	  ? `${lotName?.toLowerCase().replace(/\s+/g, "-")}-${existingAuction.lotNumber}`
	  : existingAuction.slug;
  
	// Müzayedeyi güncelleyin
	const updatedAuction = await prisma.auction.update({
	  where: { id: auctionId },
	  data: {
		detailsText,
		status: "scheduled",
		location,
		lotName: lotName || undefined, // lotName varsa güncelle, yoksa dokunma
		slug: lotName ? slug : undefined, // lotName varsa slug'ı güncelle, yoksa dokunma
		rejectionReason: '',
		carDetail: {
		  update: {
			brand: carDetail?.brand,
			model: carDetail?.model,
			year: carDetail?.year,
			vinCode: carDetail?.vinCode,
			vehicleType: carDetail?.vehicleType,
			color: carDetail?.color,
			mileage: carDetail?.mileage,
			engineCapacity: carDetail?.engineCapacity,
			carSegments: carDetail?.carSegments,
			driveType: carDetail?.driveType,
			engine: carDetail?.engine,
			transmission: carDetail?.transmission,
			fuelType: carDetail?.fuelType,
			brakeSystem: carDetail?.brakeSystem,
			frontImage: carDetail?.frontImage,
			backImage: carDetail?.backImage,
			insideImage: carDetail?.insideImage,
			othersImage: carDetail?.othersImage,
			insurancePolicy: carDetail?.insurancePolicy,
			technicalDocument: carDetail?.technicalDocument,
		  },
		},
	  },
	  include: {
		carDetail: true,
	  },
	});
  
	return updatedAuction;
  }
  
  
  async getAuctionById(auctionId: string) {
	const auction = await prisma.auction.findUnique({
	  where: { id: auctionId },
	  include: {
		carDetail: true,
	  },
	});
  
	if (!auction) {
	  throw new Error('Auction not found');
	}
  
	return auction;
  }
  

//************************************* */
	
	


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
	async getAuctions(filters: any,skip: number, limit: number) {
		try {
		  const auctions = await prisma.auction.findMany({
			where: {
			  lotName: filters.lotName ? filters.lotName : undefined,
			  location: filters.location ? filters.location : undefined,
			  status: LotStatus.active,
			  carDetail: filters.carDetail
				? {
					brand: filters.carDetail.brand ? filters.carDetail.brand : undefined,
					model: filters.carDetail.model ? filters.carDetail.model : undefined,
					year: filters.carDetail.year ? filters.carDetail.year : undefined,
				  }
				: undefined,
			},
			include: {
			  carDetail: true, 
			  wishlist:true
			},
			 skip: skip, 
     		 take: limit, 
		  });
	
		  return auctions;
		} catch (error) {
		  throw new Error('Auctionları getirirken bir hata oluştu.');
		}
	  }
	
	  // Belirli bir Auction'ı slug'a göre getirir
	  async getAuctionBySlug(slug: string) {
		try {
		  const auction = await prisma.auction.findUnique({
			where: { slug },
			include: {
			  carDetail: true,
			  bides:true,
			  participants:true,
			  wishlist:true

			},
		  });
	
		  if (!auction) {
			throw new Error('Auction bulunamadı.');
		  }
	
		  return auction;
		} catch (error) {
		  throw new Error('Auctionı getirirken bir hata oluştu.');
		}
	  }

	  async deleteAuction(id:string){
		try {
			const  auction = await prisma.auction.delete({
				where: { id },
			})

			console.log(auction);
			

		} catch (error) {
			throw new Error("Have something problem while delete auction")
		}

	  }

	
}

export {CarDetailFilter, AuctionService};
