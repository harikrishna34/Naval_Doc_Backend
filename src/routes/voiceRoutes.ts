import { Router } from 'express';
import { handleVoiceRequest } from '../controllers/voiceController';

const router = Router();

// Define routes for voice functionality
router.get('/getClientData', handleVoiceRequest);

export default router;