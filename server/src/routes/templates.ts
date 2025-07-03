import { Router } from 'express';
import { getTemplates, getTemplate } from '../controllers/templatesController';

const router = Router();

// GET /api/templates
router.get('/', getTemplates);

// GET /api/templates/:id
router.get('/:id', getTemplate);

export default router;