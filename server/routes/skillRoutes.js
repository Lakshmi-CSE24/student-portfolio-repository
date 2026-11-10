import express from 'express';
import {
  getSkills,
  getSkill,
  createSkill,
  updateSkill,
  deleteSkill,
} from '../controllers/skillController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All skill routes require valid JWT authentication
router.use(authenticateToken);

router.get('/', getSkills);
router.get('/:id', getSkill);
router.post('/', createSkill);
router.put('/:id', updateSkill);
router.delete('/:id', deleteSkill);

export default router;
