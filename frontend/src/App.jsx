import React from 'react'
import AlgoSelector from './components/AlgoSelector'
import ControlPanel from './components/ControlPanel'
import TokenBucketViz from './components/TokenBucketViz'
import FixedWindowViz from './components/FixedWindowViz'
import SlidingWindowViz from './components/SlidingWindowViz'
import RequestFeed from './components/RequestFeed'
import StatsBar from './components/StatsBar'
import ComparisonTable from './components/ComparisonTable'
import ConfigPanel from './components/ConfigPanel'
import useRateLimiter from './hooks/useRateLimiter'
import { useState } from 'react'

export default function App() {
  const { feed, stats, doRequest, statsRef, resetState } = useRateLimiter()
  const [algorithm, setAlgorithm] = useState('token_bucket')
  const [config, setConfig] = useState({ maxRequests: 10, windowMs: 10000, maxTokens: 10, refillRate: 2 })

  return (
    <div className="min-h-screen p-4 pb-8 sm:p-6 sm:pb-10 lg:p-8 lg:pb-12">
      <header className="mb-8 sm:mb-10 lg:mb-12">
        <h1 style={{ fontFamily: "'JetBrains Mono', monospace" }} className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 leading-tight">
          ⚡ RATE LIMITER VISUALIZER
        </h1>
        <p className="text-text-muted text-xs sm:text-sm tracking-wider sm:tracking-widest">Real HTTP traffic. Redis Lua scripts. Production algorithms.</p>
      </header>

      <main className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        <section className="lg:col-span-3 space-y-6 flex flex-col lg:min-h-[calc(100vh-180px)]">
          {/* Algo Selector & Controls */}
          <div className="card p-6">
            <AlgoSelector algorithm={algorithm} setAlgorithm={setAlgorithm} />
            <ControlPanel algorithm={algorithm} config={config} doRequest={doRequest} resetState={resetState} />
          </div>

          {/* Visualizations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TokenBucketViz statsRef={statsRef} />
            <FixedWindowViz statsRef={statsRef} />
            <SlidingWindowViz statsRef={statsRef} />
          </div>

          {/* Request Feed */}
          <div className="flex-1 flex flex-col">
            <RequestFeed feed={feed} />
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          <StatsBar stats={stats} />
          <ConfigPanel config={config} setConfig={setConfig} />
          <ComparisonTable />
        </aside>
      </main>
    </div>
  )
}
