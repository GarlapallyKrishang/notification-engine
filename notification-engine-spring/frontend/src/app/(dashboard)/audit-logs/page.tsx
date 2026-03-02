'use client';

import { useState, useEffect } from 'react';

export default function AuditLogs() {
    const [logs, setLogs] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchLogs = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/audit-logs`);
            const data = await res.json();
            setLogs(data);
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const filteredLogs = logs.filter((log: any) =>
        JSON.stringify(log).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white">System Audit Logs</h1>
                <button onClick={fetchLogs} className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                    ↻ Refresh
                </button>
            </div>

            <div className="glass-panel p-4 rounded-2xl flex items-center space-x-4">
                <span className="text-slate-400">🔍</span>
                <input
                    type="text"
                    placeholder="Filter logs by ID, reason, or decision..."
                    className="bg-transparent border-none text-white text-sm w-full focus:ring-0 placeholder-slate-600 outline-none"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-300">
                        <thead className="bg-slate-900 border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4">Event ID</th>
                                <th className="px-6 py-4">Decision</th>
                                <th className="px-6 py-4">Reasoning</th>
                                <th className="px-6 py-4">Origin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {filteredLogs.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No logs found</td></tr>
                            ) : filteredLogs.map((log: any) => (
                                <tr key={log.id || log._id} className="hover:bg-slate-800/30 transition-colors duration-200">
                                    <td className="px-6 py-4 whitespace-nowrap text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-indigo-300">{(log.notificationId || log.notification_id || '').substring(0, 8)}...</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${log.decision === 'NOW' ? 'bg-rose-500/10 text-rose-400' :
                                            log.decision === 'LATER' ? 'bg-amber-500/10 text-amber-400' :
                                                'bg-slate-500/10 text-slate-400'
                                            }`}>
                                            {log.decision}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 max-w-sm truncate" title={log.reason}>{log.reason}</td>
                                    <td className="px-6 py-4">
                                        {(log.aiUsed || log.ai_used) ? (
                                            <span className="px-2 py-1 bg-purple-500/10 text-purple-400 rounded-lg text-xs font-medium">✨ AI</span>
                                        ) : (log.fallbackUsed || log.fallback_used) ? (
                                            <span className="px-2 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-xs font-medium">⚡ Rule Fallback</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded-lg text-xs font-medium">⚙️ System</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
