import React from 'react'

const comparison = [
  {
    feature: 'Allows bursts',
    tokenBucket: '✅ Yes',
    fixedWindow: '❌ No',
    slidingWindow: '⚠️ Partial'
  },
  {
    feature: 'Boundary spike bug',
    tokenBucket: '✅ No',
    fixedWindow: '❌ Yes',
    slidingWindow: '✅ No'
  },
  {
    feature: 'Race condition safe',
    tokenBucket: '✅ Lua',
    fixedWindow: '✅ Atomic',
    slidingWindow: '✅ Lua'
  },
  {
    feature: 'Redis keys',
    tokenBucket: '2',
    fixedWindow: '1',
    slidingWindow: '3'
  },
  {
    feature: 'Used by',
    tokenBucket: 'Stripe, AWS',
    fixedWindow: 'Basic APIs',
    slidingWindow: 'Cloudflare'
  },
  {
    feature: 'Best for',
    tokenBucket: 'Burst-tolerant',
    fixedWindow: 'Simple quotas',
    slidingWindow: 'High accuracy'
  }
]

export default function ComparisonTable() {
  return (
    <div className="card p-6">
      <h3 style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-sm uppercase tracking-widest text-text-muted mb-4">
        Algorithm Comparison
      </h3>

      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border">
            <th style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-left py-2 px-2 text-text-muted font-bold">Feature</th>
            <th style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-left py-2 px-2 text-accent-green font-bold">Token</th>
            <th style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-left py-2 px-2 text-accent-blue font-bold">Fixed</th>
            <th style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-left py-2 px-2 text-accent-green font-bold">Sliding</th>
          </tr>
        </thead>
        <tbody>
          {comparison.map((row, i) => (
            <tr key={i} className="border-b border-border hover:bg-bg-card-hover transition-colors">
              <td className="py-2 px-2 text-text-muted">{row.feature}</td>
              <td className="py-2 px-2 text-accent-green">{row.tokenBucket}</td>
              <td className="py-2 px-2 text-accent-blue">{row.fixedWindow}</td>
              <td className="py-2 px-2 text-accent-green">{row.slidingWindow}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-xs text-text-muted leading-relaxed">
        <p>💡 <strong>Token Bucket:</strong> Refills tokens continuously. Great for bursty traffic.</p>
        <p className="mt-2">🪟 <strong>Fixed Window:</strong> Resets counter every N seconds. Simple but has boundary spike bug.</p>
        <p className="mt-2">📊 <strong>Sliding Window:</strong> Fixes the boundary spike. Most accurate but more complex.</p>
      </div>
    </div>
  )
}
