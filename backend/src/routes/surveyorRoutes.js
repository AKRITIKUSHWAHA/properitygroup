import { Router } from 'express';
import { getSurveyors } from '../controllers/surveyorController.js';
import { verifyJWT } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);

router.get('/', getSurveyors);

export default router;

