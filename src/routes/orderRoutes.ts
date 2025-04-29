import express from 'express';
import { placeOrder } from '../controllers/orderController';
import authenticateToken from '../middlewares/authMiddleware'; // Middleware for authentication

const router = express.Router();

// Route to place an order
router.post('/placeOrder', authenticateToken, placeOrder);

export default router;