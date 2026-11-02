import { Router } from 'express';
import { verifyJWT } from '../middlewares/authMiddleware.js';
import {
  uploadReport,
  uploadSitePhotos,
  uploadDocument,
} from '../middlewares/uploadMiddleware.js';
import {
  handleSingleUpload,
  handleMultipleUploads,
} from '../controllers/uploadController.js';

const router = Router();

router.use(verifyJWT);

// 1. Upload Survey Report PDF (Max 50MB)
router.post('/report', uploadReport.single('file'), handleSingleUpload('reports'));

// 2. Upload Document (Signed terms, compliance docs) (Max 30MB)
router.post('/document', uploadDocument.single('file'), handleSingleUpload('documents'));

// 3. Upload Site Inspection Photos (Up to 20 photos)
router.post('/site-photos', uploadSitePhotos.array('photos', 20), handleMultipleUploads('site-photos'));

export default router;
