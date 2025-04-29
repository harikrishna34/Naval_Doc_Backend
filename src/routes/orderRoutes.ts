import express from 'express';
import { placeOrder ,getAllOrders,listOrders} from '../controllers/orderController';
import authenticateToken from '../middlewares/authMiddleware'; // Middleware for authentication

const router = express.Router();

// Route to place an order
router.post('/placeOrder', authenticateToken, placeOrder);

router.get('/getAllOrders', authenticateToken, getAllOrders);

router.get('/listOrders', authenticateToken, listOrders);

export default router;