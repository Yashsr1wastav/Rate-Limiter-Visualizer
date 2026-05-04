import React from 'react'

export default function RequestFeed({ feed = [] }) {
  return (
    <div className="card p-6">
      <h3 style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-sm uppercase tracking-widest text-text-muted mb-4">
        Request Log
      </h3>
      <div className="h-64 overflow-y-auto space-y-2 custom-scrollbar">
        {feed.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            No requests yet. Click Fire Request to start.
          </div>
        ) : (
          feed.map((entry, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg border transition-all slide-in ${
                entry.status === 429
                  ? 'bg-accent-red bg-opacity-10 border-accent-red text-accent-red'
                  : 'bg-accent-green bg-opacity-10 border-accent-green text-accent-green'
              }`}
            >
              <div style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-xs font-bold flex items-center justify-between">
                <span>
                  {entry.status === 429 ? '❌ #' : '✅ #'}{entry.requestId}
                </span>
                <span>
                  {entry.status} {entry.algorithm?.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <div className="text-xs mt-1 opacity-80">
                {entry.tokens !== undefined && `Tokens: ${entry.tokens} `}
                {entry.count !== undefined && `Count: ${entry.count} `}
                {entry.latency && `| ${entry.latency}ms`}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
