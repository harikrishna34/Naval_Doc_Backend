import { Router } from 'express';
import { createMenuWithItems,getAllMenus } from '../controllers/menuController';
import authenticateToken from '../middlewares/authMiddleware';

const router = Router();

// Create a menu with items
router.post('/createMenuWithItems', authenticateToken, createMenuWithItems);

router.get('/getAllMenus', authenticateToken, getAllMenus);

export default router;