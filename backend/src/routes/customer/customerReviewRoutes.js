import { Router } from 'express';
import {
  getCustomerReviews,
  submitCustomerReview,
} from '../../controllers/customer/customerReviewController.js';
import { verifyJWT, authorizeRoles } from '../../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('CUSTOMER'));

// Customer Menu 11: Leave a Review
router.get('/', getCustomerReviews);
router.post('/', submitCustomerReview);

export default router;

