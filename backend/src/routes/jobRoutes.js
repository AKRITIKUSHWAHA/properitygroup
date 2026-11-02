import { Router } from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJobStage,
  assignSurveyor,
} from '../controllers/jobController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);

router.get('/', getJobs);
router.get('/:id', getJobById);
router.post('/', authorizeRoles('ADMIN'), createJob);
router.patch('/:id/stage', authorizeRoles('ADMIN'), updateJobStage);
router.patch('/:id/assign-surveyor', authorizeRoles('ADMIN'), assignSurveyor);

export default router;

