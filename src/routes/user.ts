import express from 'express';
import UserController from '../controller/user';
import { ensureAuthenticated } from '../middleware/authMiddleware';

const router = express.Router();
const userController = new UserController();


router.get('/:userId/get-participat-auctions',ensureAuthenticated, (req, res, next) => userController.getUserParticipants(req, res, next));
router.get('/:userId/get-user-own-auctions', ensureAuthenticated,(req, res, next) => userController.getUserOwnAuctions(req, res, next));

router.post('/:userId/change-password',ensureAuthenticated, (req, res,next) => userController.changePassword(req, res,next));
router.post('/:userId/update-user-info',ensureAuthenticated, (req, res,next) => userController.updateUser(req, res,next));
// router.post('/:userId/get-user-win-auctions', (req, res,next) => userController.getWinnerAuctions(req, res,next));

export default router
