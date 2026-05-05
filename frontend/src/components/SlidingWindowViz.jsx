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
    <div className="card p-6 flex flex-col items-center justify-center h-64 opacity-0 animate-fade-in">
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
        <div className="h-3 bg-gray-900 rounded-[6px] overflow-hidden border border-border">
          <div
            style={{
              width: `${Math.min(100, (prev / maxRequests) * 100)}%`,
              backgroundImage: 'linear-gradient(90deg, #4488ff 0%, #8844ff 100%)',
              opacity: 0.5,
              transition: 'width 0.3s ease',
              boxShadow: '0 0 8px rgba(68, 136, 255, 0.6)'
            }}
            className="h-full rounded-[6px]"
          />
        </div>

        {/* Current window */}
        <div className="h-3 bg-gray-900 rounded-[6px] overflow-hidden border border-border">
          <div
            style={{
              width: `${Math.min(100, (curr / maxRequests) * 100)}%`,
              backgroundImage: 'linear-gradient(90deg, #4488ff 0%, #8844ff 100%)',
              transition: 'width 0.3s ease',
              boxShadow: '0 0 8px rgba(68, 136, 255, 0.6)'
            }}
            className="h-full rounded-[6px]"
          />
        </div>
      </div>

      {(prev > 0 || curr > 0) && (
        <div className="mt-3 text-center font-mono formula">
          <div className="text-sm leading-relaxed">
            {prev > 0 ? (
              <>
                <span style={{ color: '#4488ff', fontSize: '1.05rem', fontWeight: 700 }}>{prev}</span>{' '}
                <span style={{ color: 'var(--text-muted)' }}>×</span>{' '}
                <span style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>{overlap.toFixed(2)}</span>{' '}
                <span style={{ color: 'var(--text-muted)' }}>+</span>{' '}
                <span style={{ color: '#00ff88', fontSize: '1.05rem', fontWeight: 700 }}>{curr}</span>{' '}
                <span style={{ color: 'var(--text-muted)' }}>=</span>{' '}
                <span style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 800 }}>{weighted}</span>
              </>
            ) : (
              <>
                <span style={{ color: '#4488ff', fontSize: '1.05rem', fontWeight: 700 }}>0</span>{' '}
                <span style={{ color: 'var(--text-muted)' }}>+</span>{' '}
                <span style={{ color: '#00ff88', fontSize: '1.05rem', fontWeight: 700 }}>{curr}</span>{' '}
                <span style={{ color: 'var(--text-muted)' }}>=</span>{' '}
                <span style={{ color: '#ffffff', fontSize: '1.1rem', fontWeight: 800 }}>{weighted}</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
