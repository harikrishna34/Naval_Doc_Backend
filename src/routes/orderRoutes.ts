import express from 'express';
import { placeOrder ,getAllOrders,listOrders,getOrdersSummary,getOrdersByCanteen,getOrderById,processCashfreePayment,cashfreeCallback} from '../controllers/orderController';
import authenticateToken from '../middlewares/authMiddleware'; // Middleware for authentication

const router = express.Router();

// Route to place an order
router.post('/placeOrder', authenticateToken, placeOrder);

router.get('/getAllOrders', authenticateToken, getAllOrders);

router.get('/listOrders', authenticateToken, listOrders);

router.get('/getOrderById', authenticateToken, getOrderById);


router.get('/ordersSummary',authenticateToken, getOrdersSummary);

router.get('/getOrdersByCanteen',authenticateToken, getOrdersByCanteen);

router.post('/processCashfreePayment', processCashfreePayment);

router.post('/cashfreecallback', cashfreeCallback);


export default router;