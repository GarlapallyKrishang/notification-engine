'use client';

import { useState, useEffect } from 'react';

export default function Queue() {
    const [queue, setQueue] = useState([]);

    const fetchQueue = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/notifications?status=LATER`);
            const data = await res.json();
            setQueue(data);
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        fetchQueue();
        // Auto refresh queue to see the scheduler clear it
        const interval = setInterval(fetchQueue, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">LATER Queue</h1>
                    <p className="text-sm text-slate-400 mt-1">Events waiting for background batch processing.</p>
                </div>
                <div className="flex items-center space-x-3 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    <span className="text-sm text-slate-300">Next batch in ~2 mins</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {queue.length === 0 ? (
                    <div className="col-span-full h-64 border border-dashed border-slate-700 rounded-2xl flex flex-col items-center justify-center text-slate-500">
                        <svg className="w-12 h-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M5 13l4 4L19 7" />
                        </svg>
                        <p>Queue is empty. Scheduler has processed all items.</p>
                    </div>
                ) : queue.map((job: any) => (
                    <div key={job._id} className="glass-panel p-5 rounded-2xl flex flex-col relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
                        <div className="absolute top-0 right-0 p-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-amber-500/10 text-amber-400">
                                PENDING
                            </span>
                        </div>

                        <p className="text-xs text-slate-500 mb-2 font-mono">{job._id}</p>
                        <h3 className="text-base font-semibold text-white mb-1 truncate">{job.event_type}</h3>
                        <p className="text-sm text-slate-400 line-clamp-3 mb-4 flex-1">{job.message}</p>

                        <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs text-slate-500">
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {new Date(job.timestamp).toLocaleTimeString()}
                            </span>
                            <span>{job.source}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
