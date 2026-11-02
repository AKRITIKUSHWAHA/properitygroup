import { Router } from 'express';
import { getCompanies, createCompany } from '../controllers/companyController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);

router.get('/', getCompanies);
router.post('/', authorizeRoles('ADMIN', 'STAFF'), createCompany);

export default router;

