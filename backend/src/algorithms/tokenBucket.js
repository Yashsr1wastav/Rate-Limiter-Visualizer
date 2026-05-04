// Lua script ensures atomic read-modify-write (no race conditions in distributed env)
const REFILL_SCRIPT = `
local key_tokens = KEYS[1]
local key_refill = KEYS[2]
local max_tokens = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local tokens = tonumber(redis.call('GET', key_tokens) or max_tokens)
local last_refill = tonumber(redis.call('GET', key_refill) or now)
local elapsed = (now - last_refill) / 1000
local new_tokens = math.min(max_tokens, tokens + elapsed * refill_rate)

if new_tokens >= 1 then
  new_tokens = new_tokens - 1
  redis.call('SET', key_tokens, new_tokens)
  redis.call('SET', key_refill, now)
  return {1, tostring(new_tokens)}
else
  redis.call('SET', key_tokens, new_tokens)
  redis.call('SET', key_refill, now)
  return {0, tostring(new_tokens)}
end
`;

export async function tokenBucketCheck(redis, userId, config = {}) {
  const { maxTokens = 10, refillRate = 2 } = config;
  const result = await redis.eval(
    REFILL_SCRIPT, 2,
    `tb:${userId}:tokens`, `tb:${userId}:refill`,
    maxTokens, refillRate, Date.now()
  );
  return {
    allowed: result[0] === 1,
    tokens: parseFloat(result[1]).toFixed(2),
    maxTokens,
    algorithm: 'token_bucket'
  };
}
