import React, { useEffect, useState } from 'react'

export default function TokenBucketViz({ statsRef }) {
  const [tokens, setTokens] = useState(0)
  const [maxTokens, setMaxTokens] = useState(10)

  useEffect(() => {
    const id = setInterval(() => {
      const s = statsRef.current
      if (s?.token_bucket && s.token_bucket.tokens !== null) {
        setTokens(parseFloat(s.token_bucket.tokens) || 0)
        setMaxTokens(s.token_bucket.maxTokens || 10)
      }
    }, 100)
    return () => clearInterval(id)
  }, [statsRef])

  const pct = Math.min(100, Math.max(0, (tokens / maxTokens) * 100))
  const color = pct > 50 ? 'var(--accent-green)' : pct > 25 ? 'var(--accent-yellow)' : 'var(--accent-red)'

  return (
    <div className="card p-6 flex flex-col items-center justify-center h-64">
      <h3 style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-sm uppercase tracking-widest text-text-muted mb-4">
        Token Bucket
      </h3>
      
      {/* Bucket SVG */}
      <svg width="120" height="160" viewBox="0 0 120 160" className="mb-4">
        {/* Bucket outline */}
        <defs>
          <clipPath id="bucket-clip">
            <path d="M 20 40 L 30 20 L 90 20 L 100 40 L 100 130 Q 100 140 90 140 L 30 140 Q 20 140 20 130 Z" />
          </clipPath>
        </defs>

        {/* Liquid fill */}
        <rect
          x="20"
          y={120 - (pct / 100) * 100}
          width="80"
          height={(pct / 100) * 100}
          fill={color}
          opacity="0.7"
          clipPath="url(#bucket-clip)"
          style={{ transition: 'all 200ms ease' }}
        />

        {/* Bucket outline */}
        <path
          d="M 20 40 L 30 20 L 90 20 L 100 40 L 100 130 Q 100 140 90 140 L 30 140 Q 20 140 20 130 Z"
          fill="none"
          stroke={color}
          strokeWidth="2"
          style={{ transition: 'stroke 200ms ease' }}
        />

        {/* Bucket handle */}
        <path d="M 30 30 Q 60 10 90 30" fill="none" stroke={color} strokeWidth="1.5" opacity="0.5" />
      </svg>

      {/* Token count */}
      <div style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-2xl font-bold mb-1" style={{ color }}>
        {tokens.toFixed(1)}
      </div>
      <div className="text-xs text-text-muted">/ {maxTokens} tokens</div>
      
      {/* Status */}
      <div className="mt-3 text-xs text-center text-text-muted">
        {pct > 50 ? '✅ Abundant' : pct > 25 ? '⚠️ Low' : '❌ Empty'}
      </div>
    </div>
  )
}
