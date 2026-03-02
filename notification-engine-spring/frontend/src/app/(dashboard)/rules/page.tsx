'use client';

import { useState, useEffect } from 'react';

export default function RulesManager() {
    const [rules, setRules] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        condition_json: '{"field": "priority_hint", "operator": "eq", "value": "critical"}',
        action: 'NOW',
        priority_boost: 10,
        active: true
    });

    const fetchRules = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/rules`);
            const data = await res.json();
            setRules(data);
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const handleDelete = async (id: string) => {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/rules/${id}`, { method: 'DELETE' });
        fetchRules();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/rules`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    condition_json: JSON.parse(formData.condition_json)
                })
            });
            setShowModal(false);
            fetchRules();
        } catch (err) {
            alert('Invalid JSON in condition');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Rules Manager</h1>
                    <p className="text-sm text-slate-400 mt-1">Configure fallback logic when AI is constrained.</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary">
                    + New Rule
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rules.map((rule: any) => (
                    <div key={rule._id} className="glass-panel p-6 rounded-2xl flex flex-col hover:-translate-y-1 transition-transform duration-300 relative group">
                        <button onClick={() => handleDelete(rule._id)} className="absolute top-4 right-4 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>

                        <div className="flex items-center space-x-3 mb-4">
                            <div className={`w-3 h-3 rounded-full shadow-lg ${rule.active ? 'bg-emerald-400 shadow-emerald-500/50' : 'bg-slate-600'}`}></div>
                            <h3 className="text-lg font-bold text-white">{rule.name}</h3>
                        </div>

                        <div className="bg-slate-950/50 rounded-xl p-3 mb-4 flex-1 border border-white/5">
                            <pre className="text-xs text-indigo-300 font-mono whitespace-pre-wrap overflow-auto h-24">
                                {JSON.stringify(rule.condition_json, null, 2)}
                            </pre>
                        </div>

                        <div className="flex justify-between items-center mt-auto border-t border-white/10 pt-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Action mapping</span>
                                <span className={`text-sm font-bold ${rule.action === 'NOW' ? 'text-rose-400' :
                                    rule.action === 'LATER' ? 'text-amber-400' : 'text-slate-400'
                                    }`}>
                                    {rule.action}
                                </span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-slate-500 uppercase tracking-wider">Priority Boost</span>
                                <span className="text-sm font-bold text-white">+{rule.priority_boost}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="glass-panel relative w-full max-w-lg rounded-3xl p-8 z-10 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-white mb-6">Create Fallback Rule</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Rule Name</label>
                                <input type="text" className="input-premium" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Condition (JSON)</label>
                                <textarea className="input-premium font-mono text-xs h-32" value={formData.condition_json} onChange={e => setFormData({ ...formData, condition_json: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Action</label>
                                    <select className="input-premium" value={formData.action} onChange={e => setFormData({ ...formData, action: e.target.value as any })}>
                                        <option value="NOW">NOW</option>
                                        <option value="LATER">LATER</option>
                                        <option value="NEVER">NEVER</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase">Priority Boost</label>
                                    <input type="number" className="input-premium" value={formData.priority_boost} onChange={e => setFormData({ ...formData, priority_boost: parseInt(e.target.value) })} />
                                </div>
                            </div>
                            <div className="flex justify-end space-x-3 mt-8">
                                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white transition-colors">Cancel</button>
                                <button type="submit" className="btn-primary">Save Rule</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
