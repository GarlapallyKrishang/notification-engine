'use client';

import { useState, useEffect } from 'react';

export default function Metrics() {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/audit-logs?limit=500`)
            .then(r => r.json())
            .then(setLogs)
            .catch(() => { });
    }, []);

    const aiCount = logs.filter((l: any) => l.ai_used).length;
    const fallbackCount = logs.filter((l: any) => l.fallback_used).length;

    const nowCount = logs.filter((l: any) => l.decision === 'NOW').length;
    const laterCount = logs.filter((l: any) => l.decision === 'LATER').length;
    const neverCount = logs.filter((l: any) => l.decision === 'NEVER').length;

    return (
        <div className="space-y-6 max-w-6xl">
            <h1 className="text-2xl font-bold text-white mb-8">System Metrics</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Classification Distribution */}
                <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500" />
                    <h2 className="text-lg font-bold text-white mb-6">Decision Distribution</h2>

                    <div className="space-y-6">
                        <MetricBar label="Priority NOW" value={nowCount} total={logs.length} color="bg-rose-500" />
                        <MetricBar label="Priority LATER" value={laterCount} total={logs.length} color="bg-amber-500" />
                        <MetricBar label="Priority NEVER" value={neverCount} total={logs.length} color="bg-slate-500" />
                    </div>
                </div>

                {/* AI vs Fallback */}
                <div className="glass-panel p-8 rounded-3xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-purple-500/20 transition-all duration-500" />
                    <h2 className="text-lg font-bold text-white mb-6">Engine Utilization</h2>

                    <div className="space-y-6">
                        <MetricBar label="AI Classification Engine" value={aiCount} total={logs.length} color="bg-purple-500" />
                        <MetricBar label="Rule-based Fallback Engine" value={fallbackCount} total={logs.length} color="bg-orange-500" />
                    </div>
                </div>

            </div>

            <div className="mt-8 glass-panel p-6 rounded-2xl flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-white text-lg">System Latency Estimates</h3>
                    <p className="text-sm text-slate-400 mt-1">Ingestion is fully non-blocking (immediate 202 Returns).</p>
                </div>
                <div className="text-right">
                    <p className="text-3xl font-light text-emerald-400">~15ms</p>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-1">P95 Ingestion</p>
                </div>
            </div>
        </div>
    );
}

function MetricBar({ label, value, total, color }: { label: string, value: number, total: number, color: string }) {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <div>
            <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-slate-300">{label}</span>
                <span className="text-xs font-mono text-slate-500">{value} Events ({percentage}%)</span>
            </div>
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-1000 ease-out relative`}
                    style={{ width: `${percentage}%` }}
                >
                    <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" style={{ clipPath: 'polygon(0 0, 20% 0, 40% 100%, 20% 100%)' }}></div>
                </div>
            </div>
        </div>
    );
}
