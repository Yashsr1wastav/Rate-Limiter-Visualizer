import React, { useEffect, useRef, useState } from 'react'

export default function TokenBucketViz({ statsRef }) {
  const [tokens, setTokens] = useState(0)
  const [maxTokens, setMaxTokens] = useState(10)
  const [dripKey, setDripKey] = useState(0)
  const prevTokensRef = useRef(null)

  useEffect(() => {
    const id = setInterval(() => {
      const s = statsRef.current
      if (s?.token_bucket && s.token_bucket.tokens !== null) {
        const nextTokens = parseFloat(s.token_bucket.tokens) || 0
        if (prevTokensRef.current !== null && nextTokens < prevTokensRef.current) {
          setDripKey(key => key + 1)
        }
        prevTokensRef.current = nextTokens
        setTokens(nextTokens)
        setMaxTokens(s.token_bucket.maxTokens || 10)
      }
    }, 100)
    return () => clearInterval(id)
  }, [statsRef])

  const pct = Math.min(100, Math.max(0, (tokens / maxTokens) * 100))
  const fillColor = pct > 60 ? '#00ff88' : pct >= 30 ? '#ffcc00' : '#ff4466'
  const liquidGradient = pct > 60 ? 'url(#liquid-green)' : pct >= 30 ? 'url(#liquid-yellow)' : 'url(#liquid-red)'
  const liquidTop = 146 - (pct / 100) * 104

  return (
    <div className="card p-6 flex flex-col items-center justify-center h-64 opacity-0 animate-fade-in">
      <h3 style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-sm uppercase tracking-widest text-text-muted mb-4">
        Token Bucket
      </h3>

      <svg width="170" height="180" viewBox="0 0 170 180" className="mb-2 overflow-visible">
        <defs>
          <linearGradient id="bucket-metal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#30364c" />
            <stop offset="50%" stopColor="#121622" />
            <stop offset="100%" stopColor="#262c40" />
          </linearGradient>
          <linearGradient id="liquid-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1dff9c" />
            <stop offset="100%" stopColor="#00c96f" />
          </linearGradient>
          <linearGradient id="liquid-yellow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffe066" />
            <stop offset="100%" stopColor="#ffb800" />
          </linearGradient>
          <linearGradient id="liquid-red" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff6b8d" />
            <stop offset="100%" stopColor="#ff4466" />
          </linearGradient>
          <clipPath id="bucket-clip">
            <path d="M 48 34 L 122 34 L 132 52 L 132 136 Q 132 154 114 154 L 56 154 Q 38 154 38 136 L 38 52 Z" />
          </clipPath>
        </defs>

        <ellipse cx="85" cy="34" rx="39" ry="11" fill="#0b0f18" opacity="0.85" />
        <ellipse cx="85" cy="34" rx="39" ry="11" fill="none" stroke={fillColor} strokeWidth="2" opacity="0.9" />

        <g clipPath="url(#bucket-clip)">
          <rect x="38" y={liquidTop} width="94" height={154 - liquidTop} fill={liquidGradient} style={{ transition: 'height 0.35s ease, y 0.35s ease, fill 0.3s ease' }} opacity="0.95" />
          <ellipse cx="85" cy={liquidTop} rx="37" ry="8" fill={fillColor} opacity="0.95" style={{ transition: 'cy 0.35s ease, fill 0.3s ease' }} />
          <path d="M 50 42 C 44 66, 44 108, 50 144" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2.4" strokeLinecap="round" />
        </g>

        <path d="M 48 34 L 122 34 L 132 52 L 132 136 Q 132 154 114 154 L 56 154 Q 38 154 38 136 L 38 52 Z" fill="url(#bucket-metal)" opacity="0.18" />
        <path d="M 48 34 L 122 34 L 132 52 L 132 136 Q 132 154 114 154 L 56 154 Q 38 154 38 136 L 38 52 Z" fill="none" stroke={fillColor} strokeWidth="2" opacity="0.95" />
        <ellipse cx="85" cy="154" rx="46" ry="12" fill="none" stroke={fillColor} strokeWidth="2" opacity="0.8" />
        <path d="M 60 20 Q 85 6 110 20" fill="none" stroke={fillColor} strokeWidth="1.5" opacity="0.35" />

        {dripKey > 0 && (
          <circle
            key={dripKey}
            cx="85"
            cy="154"
            r="4"
            fill={fillColor}
            opacity="0.95"
            style={{ animation: 'drip-fall 0.7s ease-out forwards' }}
          />
        )}
      </svg>

      <div className="text-center mt-1">
        <div style={{ fontFamily: "'JetBrains Mono', monospace", color: fillColor }} className="text-4xl font-bold leading-none">
          {tokens.toFixed(1)}
        </div>
        <div className="text-xs text-text-muted mt-1">/ {maxTokens} tokens</div>
      </div>

      <div className="mt-3 text-xs text-center text-text-muted flex items-center justify-center">
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: fillColor,
            display: 'inline-block',
            marginRight: '6px',
            boxShadow: `0 0 6px ${fillColor}`
          }}
        />
        {pct > 60 ? 'Healthy' : pct >= 30 ? 'Tight' : 'Low'}
      </div>
    </div>
  )
}
