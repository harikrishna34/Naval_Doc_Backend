import express from 'express';
import { placeOrder ,getAllOrders,listOrders,getOrdersSummary,getOrdersByCanteen,getOrderById} from '../controllers/orderController';
import authenticateToken from '../middlewares/authMiddleware'; // Middleware for authentication

const router = express.Router();

// Route to place an order
router.post('/placeOrder', authenticateToken, placeOrder);

router.get('/getAllOrders', authenticateToken, getAllOrders);

router.get('/listOrders', authenticateToken, listOrders);

router.get('/getOrderById', authenticateToken, getOrderById);


router.get('/ordersSummary',authenticateToken, getOrdersSummary);

router.get('/getOrdersByCanteen',authenticateToken, getOrdersByCanteen);



export default router;