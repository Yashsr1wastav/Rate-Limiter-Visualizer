import { useEffect, useRef, useState } from 'react'
import { fireRequest, fetchStats, resetState as resetRedis } from '../api/client'

export default function useRateLimiter() {
  const [feed, setFeed] = useState([])
  const [stats, setStats] = useState({ total: 0, allowed: 0, blocked: 0, latencies: [] })
  const [redisState, setRedisState] = useState(null)
  const statsRef = useRef(null)
  const isPollingRef = useRef(false)
  // expose backend redis-derived stats to visualizers via ref
  statsRef.current = redisState

  async function doRequest(algorithm, config) {
    const start = performance.now()
    try {
      const res = await fireRequest(algorithm, config)
      const latency = performance.now() - start
      const entry = { ...res, ts: Date.now(), latency: Math.round(latency) }
      
      setFeed(f => [entry, ...f].slice(0, 50))
      setStats(s => ({
        total: s.total + 1,
        allowed: s.allowed + (res.status === 200 ? 1 : 0),
        blocked: s.blocked + (res.status === 429 ? 1 : 0),
        latencies: [...s.latencies.slice(-99), latency]
      }))

      setRedisState(prev => {
        const nextState = { ...(prev || {}) }

        if (algorithm === 'token_bucket') {
          nextState.token_bucket = {
            tokens: res.tokens,
            maxTokens: res.maxTokens || 10
          }
        }

        if (algorithm === 'fixed_window') {
          nextState.fixed_window = {
            count: res.count,
            maxRequests: res.maxRequests || 10,
            windowRemaining: res.windowRemaining
          }
        }

        if (algorithm === 'sliding_window') {
          nextState.sliding_window = {
            prevCount: res.prevCount,
            currCount: res.currCount,
            overlap: res.overlap,
            weighted: res.weightedCount
          }
        }

        return nextState
      })
      return res
    } catch (err) {
      console.error('Request error', err)
      setStats(s => ({ ...s, total: s.total + 1, blocked: s.blocked + 1 }))
      throw err
    }
  }

  async function pollStats() {
    if (isPollingRef.current) return
    isPollingRef.current = true
    try {
      const s = await fetchStats()
      setRedisState(s)
    } catch (err) {
      console.error('poll stats error', err)
    } finally {
      isPollingRef.current = false
    }
  }

  async function doReset() {
    try {
      await resetRedis()
      setFeed([])
      setStats({ total: 0, allowed: 0, blocked: 0, latencies: [] })
    } catch (err) {
      console.error('reset error', err)
    }
  }

  useEffect(() => {
    const id = setInterval(pollStats, 3000)
    pollStats()
    return () => clearInterval(id)
  }, [])

  return { feed, stats, doRequest, statsRef, resetState: doReset, redisState }
}
