export async function fixedWindowCheck(redis, userId, config = {}) {
  const { maxRequests = 10, windowMs = 10000 } = config;
  const windowKey = Math.floor(Date.now() / windowMs);
  const key = `fw:${userId}:${windowKey}`;

  const count = await redis.incr(key);
  if (count === 1) await redis.pexpire(key, windowMs);

  const windowRemaining = windowMs - (Date.now() % windowMs);

  return {
    allowed: count <= maxRequests,
    count,
    maxRequests,
    windowRemaining,
    algorithm: 'fixed_window'
  };
}
