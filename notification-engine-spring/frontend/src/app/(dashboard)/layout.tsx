import { Sidebar } from '@/components/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen w-full bg-slate-950 overflow-hidden relative">
            {/* Background glow for authenticated area */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-slate-800/20 rounded-full blur-[128px] pointer-events-none" />

            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8 relative z-10">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
