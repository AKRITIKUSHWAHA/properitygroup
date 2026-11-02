import { Router } from 'express';
import {
  getSurveyorJobs,
  getSurveyorJobById,
} from '../../controllers/surveyor/surveyorJobsController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('SURVEYOR'));

// Surveyor Menu 3: My Jobs
router.get('/', getSurveyorJobs);
router.get('/:id', getSurveyorJobById);

export default router;

