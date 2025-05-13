import express from 'express';
import { placeOrder ,CashfreePaymentLinkDetails,getAllOrders,listOrders,getOrdersSummary,getOrdersByCanteen,getOrderById,processCashfreePayment,cashfreeCallback,createPaymentLink,createCashfreePaymentLink} from '../controllers/orderController';
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

router.post('/createPaymentLink', createPaymentLink);

router.post('/createCashfreePaymentLink',authenticateToken, createCashfreePaymentLink);


router.post('/CashfreePaymentLinkDetails', CashfreePaymentLinkDetails);


// Handle both GET and POST requests for the callback URL
router.get('/cashfreecallback', cashfreeCallback);
router.post('/cashfreecallback', cashfreeCallback);

export default router;