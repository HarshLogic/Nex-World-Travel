import { Router } from 'express';
import {
  getEmployees,
  createEmployee,
  updateEmployeePermissions,
  toggleEmployeeStatus,
} from '../controllers/employeeController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Master Head only management of staff accounts & permissions
router.use(authenticate, requireRole('master_head'));

router.get('/', getEmployees);
router.post('/', createEmployee);
router.patch('/:id/permissions', updateEmployeePermissions);
router.patch('/:id/status', toggleEmployeeStatus);

export default router;

