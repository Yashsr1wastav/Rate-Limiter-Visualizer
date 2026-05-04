import React from 'react'

export default function ConfigPanel({ config, setConfig }) {
  return (
    <div className="card p-6">
      <h3 style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-sm uppercase tracking-widest text-text-muted mb-4">
        Configuration
      </h3>

      <div className="space-y-4">
        {/* Max Requests */}
        <div>
          <label className="text-text-muted text-xs uppercase tracking-widest block mb-2">
            Max Requests: <span className="text-accent-blue font-bold">{config.maxRequests}</span>
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={config.maxRequests}
            onChange={e => setConfig({ ...config, maxRequests: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Window Size */}
        <div>
          <label className="text-text-muted text-xs uppercase tracking-widest block mb-2">
            Window Size: <span className="text-accent-blue font-bold">{config.windowMs}ms</span>
          </label>
          <input
            type="range"
            min="1000"
            max="30000"
            step="1000"
            value={config.windowMs}
            onChange={e => setConfig({ ...config, windowMs: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Max Tokens */}
        <div>
          <label className="text-text-muted text-xs uppercase tracking-widest block mb-2">
            Max Tokens: <span className="text-accent-green font-bold">{config.maxTokens}</span>
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={config.maxTokens}
            onChange={e => setConfig({ ...config, maxTokens: Number(e.target.value) })}
            className="w-full"
          />
        </div>

        {/* Refill Rate */}
        <div>
          <label className="text-text-muted text-xs uppercase tracking-widest block mb-2">
            Refill Rate: <span className="text-accent-green font-bold">{config.refillRate}</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="10"
            step="0.1"
            value={config.refillRate}
            onChange={e => setConfig({ ...config, refillRate: Number(e.target.value) })}
            className="w-full"
          />
        </div>
      </div>

      <div className="mt-4 p-3 bg-accent-orange bg-opacity-10 border border-accent-orange rounded-lg text-xs text-text-muted">
        <p>💡 <strong>Tip:</strong> Changes apply instantly. Run Burst Attack to test limits.</p>
      </div>
    </div>
  )
}
