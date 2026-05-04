import { tokenBucketCheck } from '../algorithms/tokenBucket.js';
import { fixedWindowCheck } from '../algorithms/fixedWindow.js';
import { slidingWindowCheck } from '../algorithms/slidingWindow.js';
import redis from '../redis/client.js';

let REQUEST_COUNTER = 0;

export default async function rateLimiter(req, res, next) {
  const algorithm = (req.header('X-Algorithm') || 'token_bucket').toLowerCase();
  const userId = req.header('X-User-Id') || 'demo_user';
  const config = req.body?.config || {};

  REQUEST_COUNTER += 1;
  const requestId = REQUEST_COUNTER;

  try {
    let result;
    if (algorithm === 'token_bucket' || algorithm === 'token-bucket') {
      result = await tokenBucketCheck(redis, userId, config);
    } else if (algorithm === 'fixed_window' || algorithm === 'fixed-window') {
      result = await fixedWindowCheck(redis, userId, config);
    } else if (algorithm === 'sliding_window' || algorithm === 'sliding-window') {
      result = await slidingWindowCheck(redis, userId, config);
    } else {
      return res.status(400).json({ error: 'Unknown algorithm' });
    }

    const timestamp = Date.now();

    if (result.allowed) {
      res.set('X-RateLimit-Algorithm', result.algorithm);
      return res.status(200).json({ ...result, timestamp, requestId });
    } else {
      // provide a basic Retry-After hint in ms
      const retryAfter = result.retryAfter || 1000;
      res.set('Retry-After', Math.ceil(retryAfter / 1000));
      return res.status(429).json({ ...result, timestamp, requestId, retryAfter });
    }
  } catch (err) {
    console.error('Rate limiter error', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
