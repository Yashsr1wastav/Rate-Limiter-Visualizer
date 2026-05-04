import express from 'express';
import redis from '../redis/client.js';

const router = express.Router();

router.get('/stats/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const windowMs = 10000;
    const now = Date.now();
    const fixedWindowKey = `fw:${userId}:${Math.floor(now / windowMs)}`;

    const [tokens, refill, fixedCountRaw, prevRaw, currRaw, start] = await Promise.all([
      redis.get(`tb:${userId}:tokens`),
      redis.get(`tb:${userId}:refill`),
      redis.get(fixedWindowKey),
      redis.get(`sw:${userId}:prev`),
      redis.get(`sw:${userId}:curr`),
      redis.get(`sw:${userId}:start`)
    ]);

    const count = parseInt(fixedCountRaw || '0', 10);
    const windowRemaining = windowMs - (now % windowMs);
    const prev = parseInt(prevRaw || '0', 10);
    const curr = parseInt(currRaw || '0', 10);
    const overlap = start ? (1 - ((Date.now() - parseInt(start, 10)) / windowMs)) : 1;
    const weighted = Math.floor(prev * Math.max(0, overlap) + curr);

    res.json({
      token_bucket: { tokens: tokens || null, refill: refill || null, maxTokens: 10 },
      fixed_window: { count, maxRequests: 10, windowRemaining },
      sliding_window: { prevCount: prev, currCount: curr, overlap: overlap.toFixed ? overlap.toFixed(2) : String(overlap), weighted }
    });
  } catch (err) {
    console.error('Stats error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

router.delete('/reset/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const now = Date.now();
    const windowMs = 10000;
    const fixedWindowKey = `fw:${userId}:${Math.floor(now / windowMs)}`;

    await redis.del(
      `tb:${userId}:tokens`,
      `tb:${userId}:refill`,
      fixedWindowKey,
      `sw:${userId}:prev`,
      `sw:${userId}:curr`,
      `sw:${userId}:start`
    );

    res.json({ reset: true });
  } catch (err) {
    console.error('Reset error', err);
    res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
