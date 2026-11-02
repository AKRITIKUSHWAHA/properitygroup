import { Router } from 'express';
import authRoutes from './authRoutes.js';
import jobRoutes from './jobRoutes.js';
import leadRoutes from './leadRoutes.js';
import quoteRoutes from './quoteRoutes.js';
import termRoutes from './termRoutes.js';
import messageRoutes from './messageRoutes.js';
import invoiceRoutes from './invoiceRoutes.js';
import surveyorRoutes from './surveyorRoutes.js';
import companyRoutes from './companyRoutes.js';

const router = Router();

// Health Check
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'NJS Property Group API',
    database: 'MySQL (Prisma ORM)',
  });
});

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/leads', leadRoutes);
router.use('/quotes', quoteRoutes);
router.use('/terms', termRoutes);
router.use('/messages', messageRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/surveyors', surveyorRoutes);
router.use('/companies', companyRoutes);

export default router;

