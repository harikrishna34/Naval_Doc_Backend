import { Router } from 'express';
import { createRole, assignRole, getAllRoles } from '../controllers/adminController';

const router = Router();

router.post('/roles', createRole);
router.post('/assign-role', assignRole);
router.get('/roles', getAllRoles); // New route to fetch all roles

export default router;