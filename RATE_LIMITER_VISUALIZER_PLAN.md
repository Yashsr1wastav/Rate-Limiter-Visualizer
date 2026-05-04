# Rate Limiter Visualizer — Full Stack Project Plan
> Reference this file before writing any code. Follow every section precisely.

---

## 📌 Project Overview

A **fullstack, production-grade interactive web app** that demonstrates how 3 rate limiting algorithms work in real time — using a **real Node.js + Redis backend** that enforces actual HTTP rate limits, and a **React frontend** that fires real API requests and visualizes the responses live.

This is NOT a simulation. Requests hit a real Express server. Redis stores the actual counters and state. The frontend gets real `200 OK` or `429 Too Many Requests` responses.

**Live Demo Goal:** Someone clicks the link in a LinkedIn post, fires a burst attack, watches real 429s come back, learns the trade-offs between algorithms, and shares it.

---

## 🎯 Core Purpose

- Enforce real rate limiting at the HTTP layer using Redis
- Show algorithm behavior differences side by side with real network responses
- Let users trigger real scenarios: normal traffic, burst attack, sustained load
- Signal serious fullstack + distributed systems engineering depth

---

## 🧠 The 3 Algorithms to Implement

### 1. Token Bucket
**How it works:**
- Redis stores `tokens` (float) and `lastRefill` (timestamp) per user/IP
- On each request: calculate elapsed time → refill tokens proportionally → consume 1 token
- If tokens >= 1 → ALLOW (200), decrement token count in Redis
- If tokens < 1 → BLOCK (429), return `Retry-After` header

**Key trait:** Allows bursts up to bucket capacity. Used by Stripe, AWS API Gateway.

**Redis keys:** `tb:{userId}:tokens`, `tb:{userId}:last_refill`

**Redis operation:** Lua script for atomicity (read + write in one operation, no race condition)

---

### 2. Fixed Window Counter
**How it works:**
- Redis stores a counter per user per time window
- Key includes the window timestamp: `fw:{userId}:{windowTimestamp}`
- Each request: INCR the key, set TTL = window duration on first request
- If count <= limit → ALLOW (200)
- If count > limit → BLOCK (429)

**Key trait:** Simple. Famous edge-case bug — 2x requests can slip through at window boundaries.

**Redis keys:** `fw:{userId}:{Math.floor(Date.now() / windowMs)}`

**Redis operation:** INCR + EXPIRE (atomic with single pipeline)

---

### 3. Sliding Window Counter
**How it works:**
- Maintains two Redis counters: previous window and current window
- Weighted formula: `weightedCount = prevCount * ((windowMs - elapsed) / windowMs) + currCount`
- If weightedCount < limit → ALLOW (200)
- If weightedCount >= limit → BLOCK (429)

**Key trait:** Fixes Fixed Window's boundary spike. More accurate. Used by Cloudflare.

**Redis keys:** `sw:{userId}:prev`, `sw:{userId}:curr`, `sw:{userId}:window_start`

**Redis operation:** Lua script for atomic read-compute-write

---

## 🖥️ Tech Stack

```
BACKEND
Runtime:        Node.js (v18+)
Framework:      Express.js
Rate Limit DB:  Redis (via ioredis)
Atomicity:      Redis Lua scripts (prevent race conditions)
CORS:           cors package
Env vars:       dotenv

FRONTEND
Framework:      React 18 (Vite)
Styling:        Tailwind CSS + custom CSS animations
HTTP Client:    axios
Charts:         Recharts
Icons:          Lucide React
State:          useState + useEffect + useRef

DEPLOYMENT
Backend:        Railway (free tier, supports Redis add-on)
Frontend:       Vercel (free tier)
Redis:          Redis Cloud free tier (30MB, enough for demo)
Repo:           GitHub (monorepo)
```

---

## 🗂️ Full Project File Structure

```
rate-limiter-visualizer/
├── backend/
│   ├── src/
│   │   ├── algorithms/
│   │   │   ├── tokenBucket.js        # Redis Lua-based token bucket
│   │   │   ├── fixedWindow.js        # Redis INCR + EXPIRE
│   │   │   └── slidingWindow.js      # Redis Lua sliding window
│   │   ├── middleware/
│   │   │   └── rateLimiter.js        # Express middleware, picks algo by header
│   │   ├── routes/
│   │   │   ├── api.js                # POST /api/request — main rate limited endpoint
│   │   │   └── stats.js              # GET /api/stats — returns Redis state for viz
│   │   ├── redis/
│   │   │   └── client.js             # ioredis client setup
│   │   └── server.js                 # Express app entry point
│   ├── .env.example
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js             # axios instance pointing to backend URL
│   │   ├── components/
│   │   │   ├── AlgoSelector.jsx      # Tab switcher: Token Bucket | Fixed Window | Sliding Window
│   │   │   ├── ControlPanel.jsx      # Fire Request, Burst Attack, Auto Mode, Reset buttons
│   │   │   ├── TokenBucketViz.jsx    # Animated bucket visualization
│   │   │   ├── FixedWindowViz.jsx    # Window progress bar visualization
│   │   │   ├── SlidingWindowViz.jsx  # Dual overlapping window visualization
│   │   │   ├── RequestFeed.jsx       # Live scrolling log of requests + responses
│   │   │   ├── StatsBar.jsx          # Total / Allowed / Blocked / Block Rate
│   │   │   ├── ComparisonTable.jsx   # Static trade-off comparison table
│   │   │   └── ConfigPanel.jsx       # Sliders: rate limit, window size, capacity
│   │   ├── hooks/
│   │   │   └── useRateLimiter.js     # Manages firing requests + collecting responses
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
└── README.md                         # Root README with full architecture overview
```

---

## ⚙️ Backend — Algorithm Implementations

### `backend/src/algorithms/tokenBucket.js`
```js
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

export async function tokenBucketCheck(redis, userId, config) {
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
```

### `backend/src/algorithms/fixedWindow.js`
```js
export async function fixedWindowCheck(redis, userId, config) {
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
```

### `backend/src/algorithms/slidingWindow.js`
```js
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

export async function slidingWindowCheck(redis, userId, config) {
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
```

---

## 🛣️ Backend Routes

### `POST /api/request`
Main rate-limited endpoint. Frontend fires this on every button click.

**Request headers:**
```
X-Algorithm: token_bucket | fixed_window | sliding_window
X-User-Id: demo_user
```

**Request body:**
```json
{ "config": { "maxRequests": 10, "windowMs": 10000, "maxTokens": 10, "refillRate": 2 } }
```

**Response 200 (allowed):**
```json
{
  "allowed": true,
  "algorithm": "token_bucket",
  "tokens": "7.40",
  "timestamp": 1714825472441,
  "requestId": 47
}
```

**Response 429 (blocked):**
```json
{
  "allowed": false,
  "algorithm": "token_bucket",
  "tokens": "0.00",
  "retryAfter": 1200,
  "timestamp": 1714825472558,
  "requestId": 48
}
```

---

### `GET /api/stats/:userId`
Returns current Redis state for all algorithms — polled by frontend every 500ms to update visualizations.

**Response:**
```json
{
  "token_bucket": { "tokens": "7.40", "maxTokens": 10 },
  "fixed_window": { "count": 3, "maxRequests": 10, "windowRemaining": 6200 },
  "sliding_window": { "prevCount": 5, "currCount": 3, "overlap": "0.62", "weighted": 6 }
}
```

### `DELETE /api/reset/:userId`
Flushes all Redis keys for that user. Called on Reset button click.

---

## 🔌 Frontend API Client

### `frontend/src/api/client.js`
```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
  timeout: 5000,
});

export async function fireRequest(algorithm, config) {
  try {
    const res = await api.post('/api/request', { config }, {
      headers: {
        'X-Algorithm': algorithm,
        'X-User-Id': 'demo_user'
      }
    });
    return { ...res.data, status: res.status };
  } catch (err) {
    if (err.response?.status === 429) {
      return { ...err.response.data, status: 429 };
    }
    throw err;
  }
}

export async function fetchStats() {
  const res = await api.get('/api/stats/demo_user');
  return res.data;
}

export async function resetState() {
  await api.delete('/api/reset/demo_user');
}
```

---

## 🎮 User Controls

| Control | What it does |
|---|---|
| **Fire Request** | Fires 1 `POST /api/request` to the real backend |
| **Burst Attack** | Fires 15 requests via `Promise.all` simultaneously |
| **Auto Mode** | Fires 1 request every 800ms on `setInterval` |
| **Reset** | Calls `DELETE /api/reset` + clears frontend state |
| **Config sliders** | Updates config sent in request body (live, no page reload) |

---

## 📊 Frontend Visualizations

### Token Bucket Visual
- Animated cylindrical bucket SVG with liquid fill level
- Fill level = `(tokens / maxTokens) * 100%`
- Liquid drains on request, refills via polling `/api/stats` every 500ms
- Color: green → yellow → red as tokens deplete
- Token count number displayed inside bucket

### Fixed Window Visual
- Horizontal progress bar = `windowRemaining / windowMs`
- Counter: `count / maxRequests`
- Hard flash + counter reset animation at window boundary
- Callout: "⚠️ Boundary spike: 2x requests can slip through here"

### Sliding Window Visual
- Two overlapping bars: prev window (faded blue) + curr window (solid blue)
- Live formula: `prev(5) × 0.62 + curr(3) = weighted(6)`
- Smoothness indicator vs Fixed Window

---

## 📋 Request Feed

Live scrolling log, newest at top, max 50 entries:

```
✅  #47  200 OK    token_bucket    tokens: 7.40    12:04:32.441
❌  #48  429 BLOCK token_bucket    tokens: 0.00    12:04:32.558  retryAfter: 1.2s
✅  #49  200 OK    token_bucket    tokens: 6.10    12:04:33.102
```

- Green row = 200, Red row = 429
- Show REAL HTTP status codes — these are actual network responses
- Animate entries sliding in from top

---

## 📈 Stats Bar

```
Total: 47    Allowed: 39 (83%)    Blocked: 8 (17%)    Algo: Token Bucket    Avg Latency: ~12ms
```

---

## 🔀 Comparison Table

| Feature | Token Bucket | Fixed Window | Sliding Window |
|---|---|---|---|
| Allows bursts | ✅ Yes | ❌ No | ⚠️ Partial |
| Boundary spike bug | ✅ No | ❌ Yes | ✅ No |
| Redis keys needed | 2 | 1 | 3 |
| Uses Lua script | ✅ Yes | ❌ No | ✅ Yes |
| Race condition safe | ✅ Yes | ✅ Yes | ✅ Yes |
| Used by | Stripe, AWS | Basic APIs | Cloudflare |
| Best for | Burst-tolerant APIs | Simple quotas | Accurate enforcement |

---

## 🎨 Design Aesthetic

**Theme:** Dark cyberpunk engineering dashboard. Feels real and technical, not a toy tutorial.

```css
:root {
  --bg-primary: #0a0a0f;
  --bg-card: #111118;
  --bg-card-hover: #1a1a24;
  --accent-green: #00ff88;
  --accent-red: #ff4466;
  --accent-yellow: #ffcc00;
  --accent-blue: #4488ff;
  --accent-orange: #ff8844;
  --text-primary: #e8e8f0;
  --text-muted: #666688;
  --border: #2a2a3a;
  --glow-green: 0 0 20px rgba(0, 255, 136, 0.3);
  --glow-red: 0 0 20px rgba(255, 68, 102, 0.3);
}
```

**Fonts:** `JetBrains Mono` (headings + code labels) + `DM Sans` (body text) — Google Fonts

**Details:**
- Glow pulse on allowed requests (green), error flash on blocked (red)
- Subtle scanline texture overlay on background
- Cards lift on hover with border color transition
- All state changes animated (200ms ease)
- Fully mobile responsive

---

## 🌍 Environment Variables

### `backend/.env.example`
```
PORT=3001
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=http://localhost:5173
```

### `frontend/.env.example`
```
VITE_API_URL=http://localhost:3001
```

### Production values
```
# Backend (Railway env vars)
REDIS_URL=rediss://user:password@redis-cloud-host:port
CORS_ORIGIN=https://your-app.vercel.app

# Frontend (Vercel env vars)
VITE_API_URL=https://your-backend.railway.app
```

---

## 🚀 Local Dev Setup

```bash
# 1. Clone the repo
git clone https://github.com/yourusername/rate-limiter-visualizer
cd rate-limiter-visualizer

# 2. Start Redis locally (pick one)
docker run -d -p 6379:6379 redis:alpine
# OR: brew install redis && redis-server

# 3. Start backend
cd backend
npm install
cp .env.example .env
npm run dev        # starts on http://localhost:3001

# 4. Start frontend (new terminal)
cd frontend
npm install
cp .env.example .env
npm run dev        # starts on http://localhost:5173
```

---

## ☁️ Deployment

```
Step 1: Push to GitHub (monorepo)

Step 2: Redis Cloud
  → Sign up free at redis.io/cloud
  → Create free 30MB database
  → Copy the connection string (rediss://...)

Step 3: Backend on Railway
  → Connect GitHub repo
  → Set root directory: /backend
  → Add env vars: REDIS_URL, CORS_ORIGIN
  → Deploy → get public URL

Step 4: Frontend on Vercel
  → Connect GitHub repo
  → Set root directory: /frontend
  → Add env var: VITE_API_URL = your Railway URL
  → Deploy → get public URL

Step 5: Update CORS_ORIGIN in Railway to your Vercel URL
```

---

## 📄 README.md Structure (GitHub)

```
# Rate Limiter Visualizer

[Live Demo Badge] [GitHub Stars Badge]

> Fire real HTTP requests. Watch Redis enforce rate limits in real time.
> Compare Token Bucket, Fixed Window, and Sliding Window algorithms side by side.

## Architecture
Client (React) → Express API → Redis Lua Scripts → 200 OK or 429 Too Many Requests

## Algorithms
- Token Bucket: ...
- Fixed Window: ...
- Sliding Window: ...

## Local Setup
...

## Engineering Decisions
- Why Redis Lua scripts (atomicity, race conditions)
- Why these 3 algorithms
- Why Token Bucket is what Stripe actually uses

## Key Learnings
...

## Built As
LinkedIn system design case study — fullstack rate limiting deep dive.
```

---

## ✅ Definition of Done

- [ ] All 3 algorithms return real 200 / 429 HTTP responses from Express
- [ ] Redis stores and updates state correctly (verify with `redis-cli KEYS *`)
- [ ] Lua scripts prevent race conditions (test with `Promise.all(15 requests)`)
- [ ] Config sliders change backend behavior without page reload
- [ ] Burst Attack (15 req) correctly triggers 429s on all 3 algorithms
- [ ] Request feed shows real HTTP status codes
- [ ] Stats bar updates in real time via polling
- [ ] Reset clears Redis keys + frontend state
- [ ] Works on mobile (test in Chrome devtools)
- [ ] Backend live on Railway, Frontend live on Vercel
- [ ] Redis on Redis Cloud free tier
- [ ] GitHub repo public with full README

---

## 💡 Copilot Prompt

Paste this after sharing this file with Copilot:

```
Read RATE_LIMITER_VISUALIZER_PLAN.md fully before writing a single line of code.

This is a fullstack project:
- Backend: Node.js + Express + Redis (ioredis) + Lua scripts
- Frontend: React 18 + Vite + Tailwind CSS + axios

Build in this exact order:
1. backend/ scaffold — Express + ioredis + dotenv + cors
2. backend/src/redis/client.js — ioredis connection with REDIS_URL from env
3. All 3 algorithm files with Lua scripts exactly as written in the plan
4. rateLimiter.js middleware
5. Express routes: POST /api/request, GET /api/stats/:userId, DELETE /api/reset/:userId
6. server.js entry point
7. frontend/ scaffold — Vite + React + Tailwind
8. frontend/src/api/client.js — axios client
9. All frontend components in the order listed in the plan
10. Wire everything together

Follow the design aesthetic exactly.
Use the CSS variables exactly as specified.
Use JetBrains Mono + DM Sans fonts from Google Fonts.
Do NOT simplify. Do NOT skip the Lua scripts. Build the complete project.
```

---

*File version: 2.0 — Fullstack Edition | LinkedIn comeback — Rate Limiter System Design Deep Dive*
