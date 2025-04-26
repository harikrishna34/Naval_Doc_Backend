import { Router } from 'express';
import { createItem ,getAllItems} from '../controllers/itemController';
import authenticateToken from '../middlewares/authMiddleware'; // Import the authentication middleware
import upload from '../middlewares/multerConfig';

const router = Router();

router.post('/createItem',authenticateToken,upload.single('image'), createItem);


router.get('/getItems', getAllItems);

export default router;