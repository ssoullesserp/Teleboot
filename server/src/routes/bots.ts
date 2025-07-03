import { Router } from 'express';
import { getBots, getBot, createBot, updateBot, deleteBot } from '../controllers/botsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/bots
router.get('/', getBots);

// GET /api/bots/:id
router.get('/:id', getBot);

// POST /api/bots
router.post('/', createBot);

// PUT /api/bots/:id
router.put('/:id', updateBot);

// DELETE /api/bots/:id
router.delete('/:id', deleteBot);

export default router;