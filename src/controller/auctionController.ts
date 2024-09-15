import { Request, Response } from "express";
import { AuctionService, CarDetailFilter } from "../service/auctionService";
import { NextFunction } from "express-serve-static-core";
import { deleteFileFromS3,deleteOldFiles } from "../utils/awsFileUpload";

class AuctionController {
	auctionService: AuctionService;

	constructor() {
		this.auctionService = new AuctionService();
	}
	async createAuction(req: Request, res: Response, next: NextFunction) {
		const user = req.user as any;
		let uploadedFiles: string[] = [];
	  
		try {
		  const { frontImage, backImage, insideImage, othersImage, insurancePolicy, technicalDocument } = req.files as {
			[fieldname: string]: Express.MulterS3.File[];
		  };
		    // Yüklenen dosyaların listesini tutuyoruz
			if (frontImage) uploadedFiles.push(frontImage[0].key);
			if (backImage) uploadedFiles.push(backImage[0].key);
			if (insideImage) uploadedFiles.push(insideImage[0].key);
			if (othersImage) othersImage.forEach(image => uploadedFiles.push(image.key));
			if (insurancePolicy) uploadedFiles.push(insurancePolicy[0].key);
			if (technicalDocument) uploadedFiles.push(technicalDocument[0].key);
		 
		  let carDetail;
		  carDetail = JSON.parse(req.body.carDetail);
	  
		
	  
		  const data = {
			lotName: req.body.lotName,
			ownerName: req.body.ownerName,
			location: req.body.location,
			status: req.body.status,
			detailsText: req.body.detailsText,
			startPrice: Number(req.body.startPrice),
			interval: Number(req.body.interval),
			carDetail: {
			  ...carDetail,
			  frontImage: frontImage ? frontImage[0].location : null,
			  backImage: backImage ? backImage[0].location : null,
			  insideImage: insideImage ? insideImage[0].location : null,
			  othersImage: othersImage ? othersImage.map(image => image.location) : [],
			  insurancePolicy: insurancePolicy ? insurancePolicy[0].location : null,
			  technicalDocument: technicalDocument ? technicalDocument[0].location : null,
			}
		  };
	  
		  const auction = await this.auctionService.createAuctionWithCarDetails(data, user);
	  
	  
		  res.status(201).json(auction);
		} catch (error) {

		  await Promise.all(
			uploadedFiles.map(async (key) => {
			  try {
				await deleteFileFromS3(key);
				console.log(`File deleted: ${key}`);
			  } catch (deleteError) {
				console.error(`Failed to delete file: ${key}`, deleteError);
			  }
			})
		  );
		  console.log(uploadedFiles);
		  
		  next(error);
		}
	  }
	

//************************************** */

async updateAuction(req: Request, res: Response, next: NextFunction) {
	const user = req.user as any;
	const { auctionId } = req.params;
	let uploadedFiles: string[] = [];
  
	try {
	  const {
		frontImage,
		backImage,
		insideImage,
		othersImage,
		insurancePolicy,
		technicalDocument,
	  } = req.files as {
		[fieldname: string]: Express.MulterS3.File[];
	  };
  
	  if (frontImage) uploadedFiles.push(frontImage[0].key);
	  if (backImage) uploadedFiles.push(backImage[0].key);
	  if (insideImage) uploadedFiles.push(insideImage[0].key);
	  if (othersImage) othersImage.forEach((image) => uploadedFiles.push(image.key));
	  if (insurancePolicy) uploadedFiles.push(insurancePolicy[0].key);
	  if (technicalDocument) uploadedFiles.push(technicalDocument[0].key);
  
	  let carDetail;
	  if(req.body.carDetail){
		  carDetail = JSON.parse(req.body.carDetail);
		}
  
	  const updatedData = {
		detailsText: req.body.detailsText,
		lotName: req.body.lotName,
		location: req.body.location,
		carDetail: {
		  ...carDetail,
		  frontImage: frontImage ? frontImage[0].location : undefined,
		  backImage: backImage ? backImage[0].location : undefined,
		  insideImage: insideImage ? insideImage[0].location : undefined,
		  othersImage: othersImage ? othersImage.map((image) => image.location) : undefined,
		  insurancePolicy: insurancePolicy ? insurancePolicy[0].location : undefined,
		  technicalDocument: technicalDocument ? technicalDocument[0].location : undefined,
		},
	  };
  
	  const existingAuction = await this.auctionService.getAuctionById(auctionId);
  
	  if (frontImage && existingAuction.carDetail?.frontImage) {
		await deleteOldFiles(existingAuction.carDetail.frontImage);
	  }
	  if (backImage && existingAuction.carDetail?.backImage) {
		await deleteOldFiles(existingAuction.carDetail.backImage);
	  }
	  if (insideImage && existingAuction.carDetail?.insideImage) {
		await deleteOldFiles(existingAuction.carDetail.insideImage);
	  }
	  if (othersImage && Array.isArray(existingAuction.carDetail?.othersImage) && existingAuction.carDetail.othersImage.length > 0) {
		for (const image of existingAuction.carDetail.othersImage) {
		  await deleteOldFiles(image);
		}
	  }
	  if (insurancePolicy && existingAuction.carDetail?.insurancePolicy) {
		await deleteOldFiles(existingAuction.carDetail.insurancePolicy);
	  }
	  if (technicalDocument && existingAuction.carDetail?.technicalDocument) {
		await deleteOldFiles(existingAuction.carDetail.technicalDocument);
	  }
  
	  const updatedAuction = await this.auctionService.updateAuctionWithCarDetails(auctionId, updatedData, user);
  
	  res.status(200).json(updatedAuction);
	} catch (error) {
	  await Promise.all(
		uploadedFiles.map(async (key) => {
		  try {
			await deleteFileFromS3(key);
			console.log(`File deleted: ${key}`);
		  } catch (deleteError) {
			console.error(`Failed to delete file: ${key}`, deleteError);
		  }
		})
	  );
  
	  next(error);
	}
  }
  



//************************************** */






	
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
		  const filters = req.query; 
		  const page = parseInt(filters.page as string) || 1; 
		  const limit = parseInt(filters.limit as string) || 10; 
		  const skip = (page - 1) * limit;
		  const auctions = await this.auctionService.getAuctions(filters,skip, limit);
	
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
		next(error)
		}
	  }


	  async deleteAuction(req: Request, res: Response,next:NextFunction){
		try {
			const user = req.user as any
         const {auctionId} =req.params
		 const deleteAuction = await this.auctionService.deleteAuction(auctionId, user)
		}catch(error){
			next(error)
		}
	  }
	
}

export default AuctionController;
