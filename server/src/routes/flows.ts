import { Router } from 'express';
import { getFlows, getFlow, createFlow, updateFlow, deleteFlow } from '../controllers/flowsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/flows/bot/:botId
router.get('/bot/:botId', getFlows);

// GET /api/flows/:id
router.get('/:id', getFlow);

// POST /api/flows/bot/:botId
router.post('/bot/:botId', createFlow);

// PUT /api/flows/:id
router.put('/:id', updateFlow);

// DELETE /api/flows/:id
router.delete('/:id', deleteFlow);

export default router;