# ⚡ Rate Limiter Visualizer

> **Real HTTP traffic. Redis Lua scripts. Production algorithms.**

A fullstack interactive dashboard that demonstrates how **3 rate limiting algorithms** work in real time using actual Redis state and real HTTP responses. Fire requests, watch algorithms enforce limits, and learn the trade-offs.

**Live Demo:** [link](https://your-vercel-url.com) (Deploy to Vercel + Railway)

---

## 🎯 What This Is

- **Backend:** Node.js + Express + Redis with atomic Lua scripts
- **Frontend:** React 18 + Vite + Tailwind CSS with real-time visualizations
- **Algorithms:** Token Bucket, Fixed Window, Sliding Window
- **Real:** Every request hits actual Express endpoints. Redis stores actual counters. You get real `200 OK` or `429 Too Many Requests` responses.

Not a simulation. Not a mock. **Production code.**

---

## 🧠 The 3 Algorithms

### **1. Token Bucket** 🪣
- Tokens refill continuously at a fixed rate
- Burst-friendly: allows traffic spikes up to bucket capacity
- **Used by:** Stripe, AWS API Gateway
- **Key trait:** Handles traffic bursts gracefully

### **2. Fixed Window** 🪟
- Counter resets every N seconds
- Simple and fast
- **Bug:** Boundary spike — 2x requests can slip through at window boundaries
- **Used by:** Basic APIs, simple quota systems

### **3. Sliding Window** 📊
- Two overlapping windows with weighted formula
- Fixes Fixed Window's boundary bug
- Most accurate
- **Used by:** Cloudflare, high-scale APIs

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Redis (use Redis Cloud free tier or local)

### Local Setup

```bash
# 1. Clone repo
git clone https://github.com/yourusername/rate-limiter-visualizer
cd rate-limiter-visualizer

# 2. Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your Redis Cloud URL (or use localhost:6379)
npm run dev  # runs on http://localhost:3001

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev  # runs on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

### Try It

1. **Fire Request** — sends 1 request, see the response
2. **Burst Attack** — sends 15 simultaneous requests, watch 429s come back
3. **Auto Mode** — fires 1 request every 800ms
4. **Switch algorithms** — tab between Token Bucket, Fixed Window, Sliding Window to see behavior differences
5. **Adjust sliders** — change rate limits in real time
6. **Reset** — clear Redis state + feed

---

## 🎨 Architecture

```
Client (React)
    ↓
Express API Routes
    ↓
Redis + Lua Scripts (atomic read-modify-write)
    ↓
200 OK / 429 Too Many Requests
```

### Backend Routes

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/api/request` | Fire rate-limited request |
| `GET` | `/api/stats/:userId` | Poll Redis state for visualizations |
| `DELETE` | `/api/reset/:userId` | Flush user's Redis keys |

### Lua Scripts

All 3 algorithms use Lua scripts for **atomicity**:
- Token Bucket: read tokens → calculate refill → consume → write (all in one Redis call)
- Sliding Window: read prev/curr → calculate weighted → increment → write (atomic)

No race conditions. No partial updates. Production-safe.

---

## 🛠️ Tech Stack

| Layer | Stack |
|-------|-------|
| **Runtime** | Node.js v18+ |
| **Framework** | Express.js |
| **Database** | Redis (via ioredis) |
| **Frontend** | React 18 (Vite) |
| **Styling** | Tailwind CSS + custom animations |
| **HTTP Client** | Axios |
| **Fonts** | JetBrains Mono + DM Sans (Google Fonts) |

---

## 📦 Project Structure

```
rate-limiter-visualizer/
├── backend/
│   ├── src/
│   │   ├── algorithms/
│   │   │   ├── tokenBucket.js      # Lua script + logic
│   │   │   ├── fixedWindow.js
│   │   │   └── slidingWindow.js
│   │   ├── middleware/
│   │   │   └── rateLimiter.js      # Express middleware
│   │   ├── routes/
│   │   │   ├── api.js              # POST /api/request
│   │   │   └── stats.js            # GET/DELETE /api/stats
│   │   ├── redis/
│   │   │   └── client.js           # ioredis connection
│   │   └── server.js               # Entry point
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js           # Axios instance
│   │   ├── components/
│   │   │   ├── AlgoSelector.jsx
│   │   │   ├── ControlPanel.jsx
│   │   │   ├── TokenBucketViz.jsx  # Animated bucket
│   │   │   ├── FixedWindowViz.jsx  # Progress bar
│   │   │   ├── SlidingWindowViz.jsx
│   │   │   ├── RequestFeed.jsx
│   │   │   ├── StatsBar.jsx
│   │   │   ├── ComparisonTable.jsx
│   │   │   └── ConfigPanel.jsx
│   │   ├── hooks/
│   │   │   └── useRateLimiter.js   # State + API calls
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
└── README.md
```

---

## 🌍 Deploy to Production

### Backend → Railway

1. Push repo to GitHub
2. Create Railway project, link GitHub repo
3. Set root directory: `/backend`
4. Add env vars:
   - `REDIS_URL=rediss://...` (Redis Cloud)
   - `CORS_ORIGIN=https://your-frontend.vercel.app`
5. Deploy

### Frontend → Vercel

1. New Vercel project, link GitHub repo
2. Set root directory: `/frontend`
3. Add env var:
   - `VITE_API_URL=https://your-backend.railway.app`
4. Deploy

### Redis → Redis Cloud

1. Sign up at redis.com/try-free
2. Create free 30MB database
3. Copy connection string (`rediss://...`)
4. Paste into Railway env

---

## 📊 What You'll Learn

- **How rate limiting works** in production systems
- **Why algorithms differ** (burst tolerance, accuracy, complexity)
- **Race conditions** and how Lua scripts prevent them
- **Real-time Redis operations** at scale
- **Distributed systems thinking** for API gateway design

---

## 💡 Key Insights

| Algorithm | Strength | Weakness |
|-----------|----------|----------|
| **Token Bucket** | Handles bursts gracefully | More complex (refill calculation) |
| **Fixed Window** | Dead simple | Boundary spike bug (2x limit can slip through) |
| **Sliding Window** | Most accurate | Slightly more complex, 3 Redis keys |

---

## 🔧 Engineering Notes

### Why Lua Scripts?

Redis commands are atomic individually, but **multiple commands** create race conditions:

```javascript
// ❌ WRONG (race condition)
const val = await redis.get(key);
await redis.set(key, val - 1);
// Between these lines, another process reads the same value

// ✅ RIGHT (atomic)
await redis.eval(`
  local val = redis.call('GET', KEYS[1])
  redis.call('SET', KEYS[1], val - 1)
  return val
`, 1, key)
// Entire operation is atomic at Redis level
```

### Why This Project?

Rate limiting is a **gateway problem**:
- Every large API gateway (AWS, Stripe, Cloudflare) implements this
- Choosing the right algorithm impacts your entire service
- Understanding the trade-offs signals systems design maturity
- Real implementation (not simulation) shows production thinking

---

## 📝 Definition of Done ✅

- [x] All 3 algorithms return real HTTP 200/429 responses
- [x] Lua scripts prevent race conditions (test with Burst)
- [x] Config sliders change behavior live
- [x] Request feed shows real status codes + latency
- [x] Stats bar tracks allowed/blocked/latency in real time
- [x] Reset clears Redis + frontend state
- [x] Responsive UI (mobile + desktop)
- [x] Production-grade styling with animations
- [x] Comparison table + algorithm explanations
- [x] Deployable to Railway + Vercel

---

## 🎓 LinkedIn Caption

> Just shipped **Rate Limiter Visualizer** — a fullstack dashboard that fires REAL HTTP requests against Node/Express/Redis, enforces actual rate limits with 3 different algorithms (Token Bucket, Fixed Window, Sliding Window), and visualizes them side-by-side.
>
> This isn't a simulation. Redis stores actual counters. Lua scripts ensure atomicity. You get real 200s and 429s.
>
> Why build this? Because understanding rate limiting algorithms signals you think about distributed systems, API gateway design, and production tradeoffs. Every major tech company (AWS, Stripe, Cloudflare) has this problem solved differently.
>
> Tech: Node.js + Express + Redis Lua + React 18 + Vite
>
> [Live demo] [GitHub] [Deploy to Railway + Vercel]

---

## 📄 License

MIT

---

**Built by [Your Name] — Systems Design Deep Dive**
