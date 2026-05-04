const SLIDING_SCRIPT = `
local key_prev = KEYS[1]
local key_curr = KEYS[2]
local key_start = KEYS[3]
local max_requests = tonumber(ARGV[1])
local window_ms = tonumber(ARGV[2])
local now = tonumber(ARGV[3])

local prev_count = tonumber(redis.call('GET', key_prev) or 0)
local curr_count = tonumber(redis.call('GET', key_curr) or 0)
local window_start = tonumber(redis.call('GET', key_start) or now)
local elapsed = now - window_start

if elapsed > window_ms then
  prev_count = curr_count
  curr_count = 0
  window_start = now
  redis.call('SET', key_prev, prev_count)
  redis.call('SET', key_curr, 0)
  redis.call('SET', key_start, now)
  redis.call('EXPIRE', key_prev, math.ceil(window_ms / 1000) * 2)
end

local overlap = 1 - (elapsed / window_ms)
local weighted = math.floor(prev_count * overlap + curr_count)

if weighted < max_requests then
  curr_count = curr_count + 1
  redis.call('SET', key_curr, curr_count)
  redis.call('EXPIRE', key_curr, math.ceil(window_ms / 1000) * 2)
  return {1, weighted, prev_count, curr_count, tostring(overlap)}
else
  return {0, weighted, prev_count, curr_count, tostring(overlap)}
end
`;

export async function slidingWindowCheck(redis, userId, config = {}) {
  const { maxRequests = 10, windowMs = 10000 } = config;
  const result = await redis.eval(
    SLIDING_SCRIPT, 3,
    `sw:${userId}:prev`, `sw:${userId}:curr`, `sw:${userId}:start`,
    maxRequests, windowMs, Date.now()
  );
  return {
    allowed: result[0] === 1,
    weightedCount: result[1],
    prevCount: result[2],
    currCount: result[3],
    overlap: parseFloat(result[4]).toFixed(2),
    maxRequests,
    algorithm: 'sliding_window'
  };
}
