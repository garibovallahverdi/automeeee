import express from "express";
import AuctionController from "../controller/auctionController";
import { ensureAuthenticated } from "../middleware/authMiddleware";

const router = express.Router();
const auctionController = new AuctionController();

router.post('/create-auction',ensureAuthenticated, (req, res, next) => auctionController.createAuction(req, res,next));
router.post('/:auctionId/update-auction',ensureAuthenticated, (req, res, next) => auctionController.createAuction(req, res,next));
router.post('/add-bidder',ensureAuthenticated, (req, res, next) => auctionController.addBidder(req, res, next));
router.get('/get-auctions', (req, res, next) => auctionController.getAuctions(req, res, next));
router.get('/get-auction/:slug', (req, res, next) => auctionController.getAuctionBySlug(req, res, next));


// router.post('/delete-auction/:id', (req, res, next) => auctionController.deleteAuction(req, res,next));

export default router;