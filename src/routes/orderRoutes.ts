import express from 'express';
import { placeOrder ,getAllOrders,listOrders} from '../controllers/orderController';
import authenticateToken from '../middlewares/authMiddleware'; // Middleware for authentication

const router = express.Router();

// Route to place an order
router.post('/placeOrder', authenticateToken, placeOrder);

router.post('/getAllOrders', authenticateToken, getAllOrders);

router.post('/listOrders', authenticateToken, listOrders);

export default router;