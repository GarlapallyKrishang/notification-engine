'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin@nexus.com' && password === 'admin') {
      router.push('/dashboard');
    } else {
      alert('Invalid credentials. Use admin@nexus.com / admin');
    }
  };

  return (
    <div className="flex w-full h-full min-h-screen items-center justify-center relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="glass-panel w-full max-w-md rounded-2xl p-8 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Nexus Engine
          </h1>
          <p className="mt-2 text-sm text-slate-400">Sign in to access the control panel</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-premium"
              placeholder="admin@nexus.com"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-premium"
              placeholder="••••••••"
              required
            />
          </div>

          <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
            <strong>Mock Credentials:</strong><br />
            Email: admin@nexus.com<br />
            Password: admin
          </div>

          <button type="submit" className="btn-primary w-full pb-3">
            Sign In &rarr;
          </button>
        </form>
      </div>
    </div>
  );
}
