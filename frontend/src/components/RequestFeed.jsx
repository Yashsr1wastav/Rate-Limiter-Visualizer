import React from 'react'

export default function RequestFeed({ feed = [] }) {
  return (
    <div className="card p-6 flex flex-col flex-1 min-h-[400px] max-h-[600px]">
      <h3 style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-sm uppercase tracking-widest text-text-muted mb-4">
        Request Log
      </h3>
      <div className="flex-1 min-h-[400px] max-h-[600px] overflow-y-auto space-y-2 custom-scrollbar pr-1">
        {feed.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            No requests yet. Click Fire Request to start.
          </div>
        ) : (
          feed.map((entry, i) => (
            <div
              key={i}
              className={`py-2 px-4 rounded-lg border transition-all slide-in ${
                entry.status === 429
                  ? 'bg-accent-red bg-opacity-10 border-accent-red text-accent-red'
                  : 'bg-accent-green bg-opacity-10 border-accent-green text-accent-green'
              }`}
            >
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }} className="grid grid-cols-[120px_minmax(0,1fr)_180px] items-center gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <span>{entry.status === 429 ? '❌' : '✅'}</span>
                  <span className="whitespace-nowrap">#{entry.requestId}</span>
                </div>

                <div className="text-text-muted min-w-0">
                  {entry.tokens !== undefined && <span className="whitespace-nowrap">Tokens: {entry.tokens}</span>}
                  {entry.count !== undefined && <span className="whitespace-nowrap">Count: {entry.count}</span>}
                  {entry.latency !== undefined && <span className="whitespace-nowrap">Latency: {entry.latency}ms</span>}
                </div>

                <div className="text-right whitespace-nowrap">
                  <span>{entry.status}</span>{' '}
                  <span className="text-text-muted">{entry.algorithm?.replace('_', ' ').toUpperCase()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
