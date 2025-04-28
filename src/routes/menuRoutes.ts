import { Router } from 'express';
import { createMenuWithItems,getAllMenus,getMenusForNextTwoDaysGroupedByDateAndConfiguration,getMenuById } from '../controllers/menuController';
import authenticateToken from '../middlewares/authMiddleware';

const router = Router();

// Create a menu with items
router.post('/createMenuWithItems', authenticateToken, createMenuWithItems);

router.get('/getAllMenus', authenticateToken, getAllMenus);

router.get('/getMenusForNextTwoDaysGroupedByDateAndConfiguration', authenticateToken, getMenusForNextTwoDaysGroupedByDateAndConfiguration);

router.get('/getMenuById', authenticateToken, getMenuById);


export default router;