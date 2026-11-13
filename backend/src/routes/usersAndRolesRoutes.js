import { Router } from 'express';
import {
  getUsersAndRoles,
  getUsersMetrics,
  createUser,
  updateUser,
  deleteUser,
  getRolePermissions,
  updateRolePermissions,
} from '../controllers/usersAndRolesController.js';
import { verifyJWT, authorizeRoles } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(verifyJWT);

// Authenticated users (Admin, Surveyor, Customer) can read their role menu permissions
router.get('/permissions', getRolePermissions);

// Only Superadmin / Admin can manage users and update RBAC permissions
router.use(authorizeRoles('ADMIN'));

router.put('/permissions', updateRolePermissions);

// Menu 2: Users & Roles Endpoints
router.get('/', getUsersAndRoles);
router.get('/metrics', getUsersMetrics);
router.post('/', createUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;

