import express from 'express';
import {
  getAchievements,
  getAchievement,
  createAchievement,
  updateAchievement,
  deleteAchievement,
} from '../controllers/achievementController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All achievement routes require valid JWT authentication
router.use(authenticateToken);

router.get('/', getAchievements);
router.get('/:id', getAchievement);
router.post('/', createAchievement);
router.put('/:id', updateAchievement);
router.delete('/:id', deleteAchievement);

export default router;
