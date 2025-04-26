import { Router } from 'express';
import { getAllCanteens,  } from '../controllers/userController';
import authenticateToken from '../middlewares/authMiddleware'; // Import the authentication middleware

const router = Router();

router.get('/getAllCanteens',authenticateToken, getAllCanteens);


export default router;