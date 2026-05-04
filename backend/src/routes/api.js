import express from 'express';
import rateLimiter from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/request', express.json(), rateLimiter);

export default router;
