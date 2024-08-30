import { Request, Response, NextFunction } from 'express';
import AgreementService from '../service/agreementService'; 
import { AgreementStatus } from '@prisma/client';

class AgreementController {
  private agreementService: AgreementService;

  constructor() {
    this.agreementService = new AgreementService();
  }
  async getUserAgreements(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const { status } = req.query;
      const agreements = await this.agreementService.getUserAgreements(userId, status as AgreementStatus);
      res.status(200).json(agreements);
    } catch (error) {
      next(error);
    }
  }

  async getAgreementById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const agreement = await this.agreementService.getAgreementById(id);
      res.status(200).json(agreement);
    } catch (error) {
      next(error);
    }
  }

  async confirmByBuyer(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const agreement = await this.agreementService.confirmAgreementByBuyer(id);

      if (agreement.buyerConfirmed && agreement.sellerConfirmed) {
        await this.agreementService.updateAgreementStatus(id, AgreementStatus.sold);
      }

      res.status(200).json(agreement);
    } catch (error) {
      next(error);
    }
  }

  async confirmBySeller(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const agreement = await this.agreementService.confirmAgreementBySeller(id);

      if (agreement.buyerConfirmed && agreement.sellerConfirmed) {
        await this.agreementService.updateAgreementStatus(id, AgreementStatus.sold);
      }

      res.status(200).json(agreement);
    } catch (error) {
      next(error);
    }
  }

  async cancelAgreement(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const agreement = await this.agreementService.cancelAgreement(id);
      res.status(200).json(agreement);
    } catch (error) {
      next(error);
    }
  }
}

export default  AgreementController;
