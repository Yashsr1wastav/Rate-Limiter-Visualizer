import React, { useEffect, useState } from 'react'

export default function SlidingWindowViz({ statsRef }) {
  const [prev, setPrev] = useState(0)
  const [curr, setCurr] = useState(0)
  const [overlap, setOverlap] = useState(0)
  const [weighted, setWeighted] = useState(0)
  const [maxRequests, setMaxRequests] = useState(10)

  useEffect(() => {
    const id = setInterval(() => {
      const s = statsRef.current
      if (s?.sliding_window) {
        setPrev(s.sliding_window.prevCount)
        setCurr(s.sliding_window.currCount)
        setOverlap(parseFloat(s.sliding_window.overlap) || 0)
        setWeighted(s.sliding_window.weighted)
        setMaxRequests(s.sliding_window.maxRequests || 10)
      }
    }, 100)
    return () => clearInterval(id)
  }, [statsRef])

  const pct = Math.min(100, (weighted / maxRequests) * 100)
  const color = pct >= 100 ? 'var(--accent-red)' : pct > 70 ? 'var(--accent-yellow)' : 'var(--accent-green)'

  return (
    <div className="card p-6 flex flex-col items-center justify-center h-64">
      <h3 style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-sm uppercase tracking-widest text-text-muted mb-4">
        Sliding Window
      </h3>

      {/* Weighted count */}
      <div style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-3xl font-bold mb-4" style={{ color }}>
        {weighted} <span className="text-lg text-text-muted">/ {maxRequests}</span>
      </div>

      {/* Overlapping bars visualization */}
      <div className="w-full px-2 space-y-2">
        {/* Previous window (faded) */}
        <div className="h-4 bg-gray-900 rounded-lg overflow-hidden border border-border">
          <div
            style={{
              width: `${Math.min(100, (prev / maxRequests) * 100)}%`,
              backgroundColor: 'var(--accent-blue)',
              opacity: 0.4,
              transition: 'width 200ms ease'
            }}
            className="h-full rounded"
          />
        </div>

        {/* Current window */}
        <div className="h-4 bg-gray-900 rounded-lg overflow-hidden border border-border">
          <div
            style={{
              width: `${Math.min(100, (curr / maxRequests) * 100)}%`,
              backgroundColor: 'var(--accent-blue)',
              transition: 'width 200ms ease'
            }}
            className="h-full rounded"
          />
        </div>
      </div>

      {/* Formula display */}
      <div className="mt-3 text-xs text-text-muted text-center font-mono">
        <div>{prev} × {overlap.toFixed(2)} + {curr} = {weighted}</div>
      </div>
    </div>
  )
}
