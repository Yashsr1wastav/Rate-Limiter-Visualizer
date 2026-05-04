import React from 'react'

export default function StatsBar({ stats }) {
  const { total = 0, allowed = 0, blocked = 0, latencies = [] } = stats
  const blockRate = total > 0 ? ((blocked / total) * 100).toFixed(1) : 0
  const avgLatency = latencies.length > 0
    ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1)
    : 0

  return (
    <div className="card p-6">
      <h3 style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-sm uppercase tracking-widest text-text-muted mb-4">
        Live Statistics
      </h3>

      <div className="space-y-3">
        {/* Total requests */}
        <div className="flex items-center justify-between">
          <span className="text-text-muted text-sm">Total Requests</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-xl font-bold text-text-primary">
            {total}
          </span>
        </div>

        {/* Allowed */}
        <div className="flex items-center justify-between">
          <span className="text-text-muted text-sm">✅ Allowed</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-xl font-bold text-accent-green">
            {allowed} <span className="text-sm text-text-muted">({total > 0 ? ((allowed / total) * 100).toFixed(1) : 0}%)</span>
          </span>
        </div>

        {/* Blocked */}
        <div className="flex items-center justify-between">
          <span className="text-text-muted text-sm">❌ Blocked</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-xl font-bold text-accent-red">
            {blocked} <span className="text-sm text-text-muted">({blockRate}%)</span>
          </span>
        </div>

        <div className="border-t border-border my-3" />

        {/* Avg Latency */}
        <div className="flex items-center justify-between">
          <span className="text-text-muted text-sm">Avg Latency</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }} className="font-mono text-sm font-bold text-accent-blue">
            {avgLatency}ms
          </span>
        </div>
      </div>
    </div>
  )
}
