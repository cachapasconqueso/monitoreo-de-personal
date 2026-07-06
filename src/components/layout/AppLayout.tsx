import { ReactNode } from 'react';
import TopNav from './TopNav';
import SideNav from './SideNav';
import BottomNav from './BottomNav';

interface NavItem { to: string; icon: string; label: string; }

interface AppLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  accentColor?: string;
}

export default function AppLayout({ children, navItems, accentColor }: AppLayoutProps) {
  return (
    <div className="flex bg-background min-h-screen">
      <TopNav />
      <SideNav items={navItems} accentColor={accentColor} />
      <main className="flex-1 w-full md:ml-64 pt-6 md:pt-20 px-4 md:px-8 pb-24 md:pb-8">
        {children}
      </main>
      <BottomNav items={navItems} />
    </div>
  );
}
