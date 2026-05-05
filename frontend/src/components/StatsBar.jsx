import React from 'react'

export default function StatsBar({ stats }) {
  const { total = 0, allowed = 0, blocked = 0, latencies = [] } = stats
  const allowedPct = total > 0 ? Math.round((allowed / total) * 100) : 0
  const blockedPct = total > 0 ? Math.round((blocked / total) * 100) : 0
  const avgLatency = latencies.length > 0
    ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1)
    : 0

  return (
    <div className="card p-6 opacity-0 animate-fade-in">
      <h3 style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-sm uppercase tracking-widest text-text-muted mb-4">
        Live Statistics
      </h3>

      <div className="space-y-3">
        {/* Total requests */}
        <div className="rounded-xl border border-border px-4 pt-3 pb-2" style={{ borderBottomColor: 'rgba(232, 232, 240, 0.25)', borderBottomWidth: '2px' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-4xl font-bold text-text-primary leading-none">
            {total}
          </div>
          <div className="text-xs text-text-muted mt-1">Total Requests</div>
        </div>

        {/* Allowed */}
        <div className="rounded-xl border border-border px-4 pt-3 pb-2" style={{ borderBottomColor: 'var(--accent-green)', borderBottomWidth: '2px' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-4xl font-bold text-accent-green leading-none">
            {allowed}
          </div>
          <div className="text-xs text-text-muted mt-1">Allowed</div>
          <div className="text-xs font-semibold text-accent-green mt-1">({allowedPct}%)</div>
        </div>

        {/* Blocked */}
        <div className="rounded-xl border border-border px-4 pt-3 pb-2" style={{ borderBottomColor: 'var(--accent-red)', borderBottomWidth: '2px' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-4xl font-bold text-accent-red leading-none">
            {blocked}
          </div>
          <div className="text-xs text-text-muted mt-1">Blocked</div>
          <div className="text-xs font-semibold text-accent-red mt-1">({blockedPct}%)</div>
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
