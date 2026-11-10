import express from 'express';
import { getProfile, updateProfile, deleteProfile } from '../controllers/profileController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All profile endpoints strictly require valid JWT authentication
router.use(authenticateToken);

router.get('/', getProfile);
router.put('/', updateProfile);
router.delete('/', deleteProfile);

export default router;
