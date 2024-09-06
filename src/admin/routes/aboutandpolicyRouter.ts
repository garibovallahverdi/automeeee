import { Router } from 'express';
import { getAbout, getPolicies, getPolicyById, updateAbout, updatePolicy } from '../controller/policyandaboutController';
import { ensureAdmin } from '../../middleware/authMiddleware';


const router = Router();

router.get('/about', ensureAdmin, (req, res, next) => getAbout(req, res, next));
router.post('/about-update', ensureAdmin,(req, res, next) => updateAbout(req, res, next));

router.get('/policies',ensureAdmin,(req, res, next)=> getPolicies(req, res, next));

router.get('/policies/:id',ensureAdmin,(req, res, next)=> getPolicyById(req, res, next));

router.post('/policies/:id',ensureAdmin,(req, res, next)=> updatePolicy(req, res, next))

export default router;
