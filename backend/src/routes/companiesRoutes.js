import { Router } from 'express';
import {
  getCompanies,
  getCompaniesMetrics,
  createCompany,
  updateCompany,
  deleteCompany,
} from '../controllers/companiesController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('ADMIN'));

// Menu 3: Companies Endpoints
router.get('/', getCompanies);
router.get('/metrics', getCompaniesMetrics);
router.post('/', createCompany);
router.patch('/:id', updateCompany);
router.delete('/:id', deleteCompany);

export default router;
