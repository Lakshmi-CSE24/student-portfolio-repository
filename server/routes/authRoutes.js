import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Public auth endpoints
router.post('/register', register);
router.post('/login', login);

// Protected user verification endpoint
router.get('/me', authenticateToken, getMe);

export default router;
