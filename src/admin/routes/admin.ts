import express from "express";
import { ensureAdmin } from "../../middleware/authMiddleware";
import { getAllWaitingAuctions, getAuctionByIdAdmin, updateAuctionStatus } from '../controller/adminAuctionController'

const router = express.Router();


router.get('/get-waiting-auctions', ensureAdmin, getAllWaitingAuctions);
router.get('/get-auction-byid', ensureAdmin, getAuctionByIdAdmin);
router.post('/update-auction-status/:id', ensureAdmin, updateAuctionStatus);


export default router;
