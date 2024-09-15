import express from "express";
import AuctionController from "../controller/auctionController";
import { ensureAuthenticated } from "../middleware/authMiddleware";
import { uploadFiles } from "../utils/awsFileUpload";

const router = express.Router();
const auctionController = new AuctionController();

router.post('/create-auction',ensureAuthenticated, uploadFiles, (req, res, next) => auctionController.createAuction(req, res,next));
router.post('/:auctionId/update-auction',ensureAuthenticated,uploadFiles, (req, res, next) => auctionController.updateAuction(req, res,next));
router.post('/add-bidder',ensureAuthenticated, (req, res, next) => auctionController.addBidder(req, res, next));
router.post('/:auctionId/delete-auction',ensureAuthenticated, (req, res, next) => auctionController.deleteAuction(req, res, next));
router.get('/get-auctions', (req, res, next) => auctionController.getAuctions(req, res, next));
router.get('/get-auction/:slug', (req, res, next) => auctionController.getAuctionBySlug(req, res, next));



export default router;