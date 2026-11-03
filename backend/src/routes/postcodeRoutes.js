import { Router } from 'express';
import { lookupAddressByPostcode } from '../controllers/postcodeController.js';

const router = Router();

// Public Postcode Lookup (for quote tool, booking modal, client onboarding)
router.get('/:postcode', lookupAddressByPostcode);

export default router;
