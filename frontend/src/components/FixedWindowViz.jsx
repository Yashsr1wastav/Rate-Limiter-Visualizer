import React, { useEffect, useState } from 'react'

export default function FixedWindowViz({ statsRef }) {
  const [count, setCount] = useState(0)
  const [remaining, setRemaining] = useState(10000)
  const [maxRequests, setMaxRequests] = useState(10)
  const [isBoundary, setIsBoundary] = useState(false)

  useEffect(() => {
    const id = setInterval(() => {
      const s = statsRef.current
      if (s?.fixed_window) {
        setCount(s.fixed_window.count)
        setRemaining(s.fixed_window.windowRemaining)
        setMaxRequests(s.fixed_window.maxRequests)
        
        // Flash on boundary
        if (s.fixed_window.windowRemaining < 500) {
          setIsBoundary(true)
          setTimeout(() => setIsBoundary(false), 300)
        }
      }
    }, 100)
    return () => clearInterval(id)
  }, [statsRef])

  const pct = Math.min(100, (count / maxRequests) * 100)
  const color = pct >= 100 ? 'var(--accent-red)' : pct > 70 ? 'var(--accent-yellow)' : 'var(--accent-blue)'

  return (
    <div className={`card p-6 flex flex-col items-center justify-center h-64 transition-all ${isBoundary ? 'border-accent-red' : ''}`}>
      <h3 style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-sm uppercase tracking-widest text-text-muted mb-4">
        Fixed Window
      </h3>

      {/* Count */}
      <div style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-3xl font-bold mb-4" style={{ color }}>
        {count} <span className="text-lg text-text-muted">/ {maxRequests}</span>
      </div>

      {/* Progress bar */}
      <div className="w-full px-2">
        <div className="h-6 bg-gray-900 rounded-lg overflow-hidden border border-border mb-3">
          <div
            style={{
              width: `${pct}%`,
              backgroundColor: color,
              transition: 'width 200ms ease, background-color 200ms ease'
            }}
            className="h-full rounded"
          />
        </div>
      </div>

      {/* Time remaining */}
      <div className="text-xs text-text-muted text-center">
        Window: {Math.max(0, remaining).toFixed(0)}ms left
      </div>

      {/* Boundary warning */}
      {isBoundary && (
        <div className="mt-2 text-xs text-accent-red font-bold pulse-glow">
          ⚠️ BOUNDARY SPIKE
        </div>
      )}
    </div>
  )
}
