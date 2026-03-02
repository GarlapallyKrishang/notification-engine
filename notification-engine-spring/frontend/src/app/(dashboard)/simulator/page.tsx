'use client';

import { useState } from 'react';

export default function EventSimulator() {
    const [formData, setFormData] = useState({
        user_id: 'user_123',
        event_type: 'payment_failed',
        message: 'Your recent payment of $49.00 failed to process.',
        source: 'billing_system',
        priority_hint: 'high'
    });
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/notifications/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            setResult({ status: res.status, data });
        } catch (err) {
            setResult({ error: 'Failed to dispatch event' });
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl">
            <h1 className="text-2xl font-bold text-white mb-6">Event Simulator</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="glass-panel p-6 rounded-2xl">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">User ID</label>
                            <input type="text" className="input-premium" value={formData.user_id} onChange={e => setFormData({ ...formData, user_id: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Event Type</label>
                            <input type="text" className="input-premium" value={formData.event_type} onChange={e => setFormData({ ...formData, event_type: e.target.value })} required />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Message</label>
                            <textarea className="input-premium min-h-[100px]" value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Source</label>
                                <input type="text" className="input-premium" value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Priority Hint</label>
                                <input type="text" className="input-premium" value={formData.priority_hint} onChange={e => setFormData({ ...formData, priority_hint: e.target.value })} />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="btn-primary w-full mt-4">
                            {loading ? 'Dispatching...' : 'Dispatch Event 🚀'}
                        </button>
                    </form>
                </div>

                <div>
                    <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Ingestion Result</h2>
                    {result ? (
                        <div className={`p-4 rounded-xl border ${result.status === 202 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-rose-500/10 border-rose-500/20 text-rose-300'}`}>
                            <pre className="text-xs overflow-auto whitespace-pre-wrap">
                                {JSON.stringify(result, null, 2)}
                            </pre>
                        </div>
                    ) : (
                        <div className="h-64 rounded-xl border border-dashed border-slate-700 flex items-center justify-center text-slate-500 text-sm">
                            Waiting for dispatch...
                        </div>
                    )}

                    <div className="mt-8 p-4 rounded-xl bg-slate-800/30 border border-slate-700 text-sm text-slate-400">
                        <p><strong>Note:</strong> Events are ingested and processed asynchronously. Check the <em>Audit Logs</em> or <em>Dashboard</em> to see final AI classification outcomes.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
