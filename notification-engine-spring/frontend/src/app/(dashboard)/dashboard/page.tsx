'use client';

import { useState, useEffect } from 'react';

export default function LiveDashboard() {
    const [metrics, setMetrics] = useState({
        total: 0,
        now: 0,
        later: 0,
        never: 0,
    });
    const [health, setHealth] = useState<any>(null);

    const fetchStats = async () => {
        try {
            const [notifsRes, healthRes] = await Promise.all([
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/notifications`),
                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/health`)
            ]);
            const notifs = await notifsRes.json();
            const h = await healthRes.json();

            const now = notifs.filter((n: any) => n.status === 'NOW').length;
            const later = notifs.filter((n: any) => n.status === 'LATER').length;
            const never = notifs.filter((n: any) => n.status === 'NEVER').length;

            setMetrics({
                total: notifs.length,
                now,
                later,
                never
            });
            setHealth(h);
        } catch (e) {
            console.error('Failed to fetch dashboard data');
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">Live Dashboard</h1>
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    <span>Auto-refreshing (5s)</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Events" value={metrics.total} color="text-blue-400" />
                <StatCard title="Priority: NOW" value={metrics.now} color="text-rose-400" />
                <StatCard title="Priority: LATER" value={metrics.later} color="text-amber-400" />
                <StatCard title="Priority: NEVER" value={metrics.never} color="text-slate-400" />
            </div>

            <div className="mt-8">
                <h2 className="text-lg font-semibold text-white mb-4">System Health</h2>
                <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-8">
                    <div className="flex-1">
                        <p className="text-sm text-slate-400 mb-1">Database Status</p>
                        <p className="text-xl font-medium text-emerald-400 flex items-center gap-2">
                            {health?.database === 'up' ? '🟢 Online' : '🔴 Offline'}
                        </p>
                    </div>
                    <div className="flex-1 border-l border-white/10 pl-8">
                        <p className="text-sm text-slate-400 mb-1">AI Circuit State</p>
                        <p className={`text-xl font-medium flex items-center gap-2 ${health?.ai_integration?.circuit_state === 'CLOSED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {health?.ai_integration?.circuit_state === 'CLOSED' ? '🟢 CLOSED (AI Active)' : '🔴 OPEN (Rules Fallback)'}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">Failures: {health?.ai_integration?.failure_count}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, color }: { title: string, value: number, color: string }) {
    return (
        <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</h3>
            <p className={`mt-2 text-4xl font-light ${color}`}>{value}</p>
        </div>
    );
}
