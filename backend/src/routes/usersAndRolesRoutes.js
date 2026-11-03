import { Router } from 'express';
import {
  getUsersAndRoles,
  getUsersMetrics,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/usersAndRolesController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);
router.use(authorizeRoles('ADMIN'));

// Menu 2: Users & Roles Endpoints
router.get('/', getUsersAndRoles);
router.get('/metrics', getUsersMetrics);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;

