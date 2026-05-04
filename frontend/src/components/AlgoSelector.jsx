import React from 'react'

const algorithms = [
  { id: 'token_bucket', label: 'Token Bucket', desc: 'Burst-tolerant' },
  { id: 'fixed_window', label: 'Fixed Window', desc: 'Simple & fast' },
  { id: 'sliding_window', label: 'Sliding Window', desc: 'Smooth & accurate' }
]

export default function AlgoSelector({ algorithm, setAlgorithm }) {
  return (
    <div className="mb-6">
      <h2 style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-sm uppercase tracking-widest text-text-muted mb-3">
        Select Algorithm
      </h2>
      <div className="flex gap-3">
        {algorithms.map(algo => (
          <button
            key={algo.id}
            onClick={() => setAlgorithm(algo.id)}
            className={`px-4 py-3 rounded-lg border-2 transition-all ${
              algorithm === algo.id
                ? 'border-accent-blue bg-accent-blue bg-opacity-20 text-accent-blue shadow-lg'
                : 'border-border hover:border-accent-blue'
            }`}
          >
            <div style={{ fontFamily: "'JetBrains Mono', monospace" }} className="font-bold text-sm">
              {algo.label}
            </div>
            <div className="text-xs text-text-muted mt-1">{algo.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
