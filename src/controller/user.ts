import { NextFunction, Request, Response } from 'express';
import UserService from '../service/userService'; 

class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }
  async getUserOwnAuctions(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.params.userId;
        const status = req.query.status as string; 

        const auctions = await this.userService.getUserOwnAuctions(userId, status);

        res.status(200).json(auctions);
    } catch (error) {
        next(error);
    }
  }

  async getUserParticipants(req: Request, res: Response,next:NextFunction) {
    try {
      const userId = req.params.userId;
      const status = req.query.status as string; 


      const auctions = await this.userService.getUserParticipants(userId,status);

      res.status(200).json(auctions);
    } catch (error) {
        next(error)
    }
  }

  async changePassword(req: Request, res: Response,next: NextFunction) {
    try {
      const { oldPassword, newPassword } = req.body;
      const {userId} = req.params

      const result = await this.userService.changePassword(userId, oldPassword, newPassword);

      res.status(200).json(result);
    } catch (error) {
     next(error)
    }
  }

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: 'Yetkisiz erişim' });
      }

      const { firstName,lastName, email, location } = req.body;
      const {userId} =req.params

      const updatedUser = await this.userService.updateUserInfo({ id: userId, firstName, lastName, email, location });

      res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  }
  
  async toggleWishlist(req: Request, res: Response,next:NextFunction) {
    const { auctionId } = req.body; 
    const user = req.user as any; 

    try {
        const result = await  this.userService.toggleWishlist(user.id, auctionId);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while updating wishlist.' });
    }
}

async getUserWishlist(req: Request, res: Response,next:NextFunction) {
    const user = req.user as any; 

    try {
        const wishlist = await  this.userService.getUserWishlist(user.id);
        return res.status(200).json(wishlist);
    } catch (error) {
        return res.status(500).json({ error: 'An error occurred while retrieving wishlist.' });
    }
}
 

}

export default UserController;
