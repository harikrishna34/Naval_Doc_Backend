import express from 'express';
import {addToCart,clearCart,removeCartItem,getCart,updateCartItem} from '../controllers/cartController';
import authenticateToken from '../middlewares/authMiddleware'; // Import the authentication middleware

const router = express.Router();

// Cart routes
router.post('/add', authenticateToken, addToCart);

router.get('/getCart', authenticateToken, getCart);

router.post('/updateCartItem', authenticateToken, updateCartItem);

router.post('/removeCartItem', authenticateToken, removeCartItem);

router.get('clearCart', authenticateToken, clearCart);

export default router;