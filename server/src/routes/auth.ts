import { Router } from 'express';
import { register, login, verifyToken } from '../controllers/authController';

const router = Router();

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// GET /api/auth/verify
router.get('/verify', verifyToken);

export default router;