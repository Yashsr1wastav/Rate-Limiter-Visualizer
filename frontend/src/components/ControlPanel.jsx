import React, { useState, useRef } from 'react'

export default function ControlPanel({ algorithm, config, doRequest, resetState }) {
  const [auto, setAuto] = useState(false)
  const [loading, setLoading] = useState(false)
  const intervalRef = useRef(null)

  async function handleFire() {
    setLoading(true)
    try {
      await doRequest(algorithm, config)
    } finally {
      setLoading(false)
    }
  }

  async function handleBurst() {
    setLoading(true)
    try {
      await Promise.all(new Array(15).fill(0).map(() => doRequest(algorithm, config)))
    } finally {
      setLoading(false)
    }
  }

  function handleAuto() {
    if (auto) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
      setAuto(false)
    } else {
      intervalRef.current = setInterval(() => doRequest(algorithm, config), 800)
      setAuto(true)
    }
  }

  async function handleReset() {
    setLoading(true)
    try {
      await resetState()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-6">
      <h2 style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-sm uppercase tracking-widest text-text-muted mb-3">
        Controls
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        <button
          onClick={handleFire}
          disabled={loading}
          className="px-4 py-3 bg-accent-green bg-opacity-20 border-2 border-accent-green text-accent-green hover:bg-opacity-30 rounded-lg transition-all font-bold text-sm"
        >
          🔥 FIRE REQUEST
        </button>
        <button
          onClick={handleBurst}
          disabled={loading}
          className="px-4 py-3 bg-accent-orange bg-opacity-20 border-2 border-accent-orange text-accent-orange hover:bg-opacity-30 rounded-lg transition-all font-bold text-sm"
        >
          💥 BURST (15x)
        </button>
        <button
          onClick={handleAuto}
          className={`px-4 py-3 border-2 rounded-lg transition-all font-bold text-sm ${
            auto
              ? 'bg-accent-blue bg-opacity-20 border-accent-blue text-accent-blue'
              : 'border-border text-text-primary hover:border-accent-blue'
          }`}
        >
          {auto ? '⏸ STOP AUTO' : '▶ AUTO MODE'}
        </button>
        <button
          onClick={handleReset}
          disabled={loading}
          className="px-4 py-3 bg-accent-red bg-opacity-20 border-2 border-accent-red text-accent-red hover:bg-opacity-30 rounded-lg transition-all font-bold text-sm"
        >
          ↺ RESET
        </button>
      </div>
    </div>
  )
}
