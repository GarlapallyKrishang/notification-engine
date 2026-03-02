import Link from 'next/link';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { name: 'Event Simulator', href: '/simulator', icon: 'M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
    { name: 'Audit Logs', href: '/audit-logs', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { name: 'LATER Queue', href: '/queue', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Rules Manager', href: '/rules', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    { name: 'Metrics', href: '/metrics', icon: 'M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z' },
];

export function Sidebar() {
    return (
        <div className="flex h-full w-64 flex-col overflow-y-auto border-r border-slate-800 bg-slate-900/50 backdrop-blur-xl">
            <div className="flex h-16 shrink-0 items-center px-6">
                <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                    Nexus Engine
                </h1>
            </div>
            <nav className="flex flex-1 flex-col px-4 py-4 mt-4 space-y-1">
                {navigation.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className="group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-all duration-200"
                    >
                        <svg
                            className="mr-3 h-5 w-5 flex-shrink-0 text-slate-400 group-hover:text-indigo-400 transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                        </svg>
                        {item.name}
                    </Link>
                ))}
            </nav>
            <div className="p-4">
                <div className="rounded-xl bg-slate-800/50 p-4 ring-1 ring-white/10">
                    <p className="text-xs font-semibold text-slate-400">System Status</p>
                    <div className="mt-2 flex items-center space-x-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        <span className="text-sm font-medium text-slate-200">All Systems Operational</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
