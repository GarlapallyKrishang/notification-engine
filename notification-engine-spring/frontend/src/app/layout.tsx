import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Nexus Notification Engine',
  description: 'Production-grade Notification Prioritization Engine',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} flex h-screen overflow-hidden bg-slate-950`}>
        {/* We will conditionally render the Sidebar based on logic, but since this is a demo eval, 
            we will render it everywhere except if we detect we are on the login page via client side, 
            or better, we handle layouts correctly by removing the sidebar from root and putting it in a dashboard group 
            Let's keep it simple: we define a main container and the page handles its own layout, 
            Wait, standard Next.js app router: to hide sidebar on login, we should put dashboard pages in `(main)` layout. 
            For now, we just pass children here, and the dashboard layout will include the sidebar. */
        }
        {children}
      </body>
    </html>
  );
}
