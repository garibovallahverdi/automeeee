import express from "express";
import AgreementController from "../controller/agreement"; 
import { ensureAuthenticated } from "../middleware/authMiddleware";

const router = express.Router();
const agreementController = new AgreementController();

router.get('/agreements/:userId', ensureAuthenticated, (req, res, next) => 
  agreementController.getUserAgreements(req, res, next)
);

router.get('/agreement/:id', ensureAuthenticated, (req, res, next) => 
  agreementController.getAgreementById(req, res, next)
);

router.put('/agreement/:id/buyer-confirm', ensureAuthenticated, (req, res, next) => 
  agreementController.confirmByBuyer(req, res, next)
);

router.put('/agreement/:id/seller-confirm', ensureAuthenticated, (req, res, next) => 
  agreementController.confirmBySeller(req, res, next)
);

router.put('/agreement/:id/cancel', ensureAuthenticated, (req, res, next) => 
  agreementController.cancelAgreement(req, res, next)
);

export default router;
