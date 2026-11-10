import express from 'express';
import { getPublicPortfolio } from '../controllers/publicController.js';

const router = express.Router();

/**
 * Public route — No authentication required
 * GET /api/public/portfolio/:slug
 */
router.get('/portfolio/:slug', getPublicPortfolio);

export default router;
