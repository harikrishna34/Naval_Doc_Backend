import express from 'express';
import { adminDashboard } from '../controllers/adminDashboardController';
import authenticateToken from '../middlewares/authMiddleware'; // Import the authentication middleware


const router = express.Router();

// Route to fetch admin dashboard data
router.get('/dashboard', authenticateToken,adminDashboard);

export default router;