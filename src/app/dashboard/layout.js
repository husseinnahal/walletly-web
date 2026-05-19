'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, 
  ArrowLeftRight, 
  TrendingUp, 
  PieChart, 
  Target, 
  Scale, 
  Wallet, 
  Calendar, 
  Coins, 
  LineChart, 
  Trophy, 
  Bot, 
  Shield, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (!user) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#6be6b0]"></div>
      </div>
    );
  }

  const navSections = [
    {
      title: 'Finance & Planning',
      items: [
        { label: 'Transactions', path: '/dashboard/transactions', icon: ArrowLeftRight, activeColor: 'bg-[#6be6b0]/5 text-[#6be6b0] border-[#6be6b0]/20', glowColor: 'text-[#6be6b0]' },
        { label: 'Budgets', path: '/dashboard/budgets', icon: PieChart, activeColor: 'bg-[#6be6b0]/5 text-[#6be6b0] border-[#6be6b0]/20', glowColor: 'text-[#6be6b0]' },
        { label: 'Savings Goals', path: '/dashboard/savings', icon: Target, activeColor: 'bg-[#EA7108]/5 text-[#EA7108] border-[#EA7108]/20', glowColor: 'text-[#EA7108]' },
        { label: 'Debt & Credit', path: '/dashboard/debt', icon: Scale, activeColor: 'bg-[#EA7108]/5 text-[#EA7108] border-[#EA7108]/20', glowColor: 'text-[#EA7108]' },
        { label: 'Bills & Payments', path: '/dashboard/bills', icon: Calendar, activeColor: 'bg-[#6be6b0]/5 text-[#6be6b0] border-[#6be6b0]/20', glowColor: 'text-[#6be6b0]' },
        { label: 'My Accounts', path: '/dashboard/accounts', icon: Wallet, activeColor: 'bg-neutral-800 text-white border-neutral-700', glowColor: 'text-white' },
        { label: 'Stats Overview', path: '/dashboard/statistics', icon: TrendingUp, activeColor: 'bg-[#EA7108]/5 text-[#EA7108] border-[#EA7108]/20', glowColor: 'text-[#EA7108]' },
      ]
    },
    {
      title: 'Wealth & Assets',
      items: [
        { label: 'Metal Assets', path: '/dashboard/metals', icon: Coins, activeColor: 'bg-[#EA7108]/5 text-[#EA7108] border-[#EA7108]/20', glowColor: 'text-[#EA7108]' },
        { label: 'Investments', path: '/dashboard/investments', icon: LineChart, activeColor: 'bg-[#6be6b0]/5 text-[#6be6b0] border-[#6be6b0]/20', glowColor: 'text-[#6be6b0]' },
      ]
    },
    {
      title: 'Tools & AI',
      items: [
        { label: 'Play & Earn', path: '/dashboard/gamification', icon: Trophy, activeColor: 'bg-[#EA7108]/5 text-[#EA7108] border-[#EA7108]/20', glowColor: 'text-[#EA7108]' },
        { label: 'AI Voice & Chat', path: '/dashboard/chatbot', icon: Bot, activeColor: 'bg-[#6be6b0]/5 text-[#6be6b0] border-[#6be6b0]/20', glowColor: 'text-[#6be6b0]' },
      ]
    },
    {
      title: 'Security & Preferences',
      items: [
        { label: 'App Security', path: '/dashboard/security', icon: Shield, activeColor: 'bg-neutral-850 text-neutral-200 border-neutral-800', glowColor: 'text-neutral-250' },
        { label: 'Settings & Profile', path: '/dashboard', icon: User, activeColor: 'bg-[#6be6b0]/5 text-[#6be6b0] border-[#6be6b0]/20', glowColor: 'text-[#6be6b0]' },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#242424] text-neutral-100 overflow-hidden font-sans">
      
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0e0e0e] border-r border-neutral-900 shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-neutral-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#6be6b0] to-[#EA7108] rounded-2xl flex items-center justify-center text-black font-extrabold shadow-lg shadow-[#6be6b0]/10">
            <Image src="/logo.png" alt="Walletly Logo" width={20} height={20} className="object-contain" />
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight uppercase">Walletly</h1>
            <span className="text-[9px] text-[#6be6b0] font-bold uppercase tracking-wider">Premium Hub</span>
          </div>
        </div>

        {/* User Card */}
        <div className="px-6 py-4 border-b border-neutral-900 bg-[#0a0a0a]/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              {user?.avatar ? (
                <Image src={user.avatar} alt="Avatar" width={38} height={38} className="rounded-full object-cover w-9.5 h-9.5 border border-neutral-800" />
              ) : (
                <div className="w-9.5 h-9.5 bg-gradient-to-br from-[#6be6b0] to-[#EA7108] rounded-full flex items-center justify-center text-black font-black text-sm shadow-sm">{user?.username?.[0]?.toUpperCase()}</div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold text-neutral-100 truncate">{user?.username}</p>
                <p className="text-xs text-neutral-500 truncate">{user?.email}</p>
              </div>
            </div>
            {/* Green Online status dot */}
            <div className="relative flex h-2 w-2 ml-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6be6b0] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6be6b0]"></span>
            </div>
          </div>
        </div>

        {/* Navigation list divided in sections */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h3 className="px-3 text-[10px] font-bold text-neutral-550 uppercase tracking-widest">{section.title}</h3>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl border border-transparent transition-all duration-200 group ${
                        isActive
                          ? `${item.activeColor} shadow-md`
                          : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40 hover:border-neutral-900/50'
                      }`}
                    >
                      <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? item.glowColor : 'text-neutral-500 group-hover:text-neutral-300'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-neutral-900">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-xs font-extrabold text-red-450 bg-red-950/20 hover:bg-red-950/30 border border-red-900/20 rounded-xl transition duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Mobile Layout Wrapper ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-6 py-4 bg-[#0e0e0e] border-b border-neutral-900 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#6be6b0] to-[#EA7108] rounded-xl flex items-center justify-center text-black shadow-sm">
              <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <span className="text-base font-black text-white tracking-tight uppercase">Walletly</span>
          </div>

          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl border border-neutral-805 transition"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* Mobile Drawer (Slide-out menu) */}
        {isMobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop Blur */}
            <div
              className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity"
              onClick={() => setIsMobileOpen(false)}
            ></div>

            {/* Sidebar content */}
            <aside className="relative flex flex-col w-72 max-w-[85vw] bg-[#0e0e0e] h-full shadow-2xl z-10 border-r border-neutral-900 animate-slide-in-right">
              {/* Header */}
              <div className="p-6 border-b border-neutral-900 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gradient-to-tr from-[#6be6b0] to-[#EA7108] rounded-xl flex items-center justify-center text-black">
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <span className="text-base font-black text-white tracking-tight uppercase">Walletly</span>
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-xl transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile Info */}
              <div className="p-6 border-b border-neutral-900 bg-[#0a0a0a]/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    {user?.avatar ? (
                      <Image src={user.avatar} alt="Avatar" width={36} height={36} className="rounded-full object-cover w-9 h-9 border border-neutral-850" />
                    ) : (
                      <div className="w-9 h-9 bg-gradient-to-br from-[#6be6b0] to-[#EA7108] rounded-full flex items-center justify-center text-black font-black text-xs">{user?.username?.[0]?.toUpperCase()}</div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-neutral-100 truncate">{user?.username}</p>
                      <p className="text-[10px] text-neutral-500 truncate">{user?.email}</p>
                    </div>
                  </div>
                  <div className="relative flex h-2 w-2 ml-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6be6b0] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6be6b0]"></span>
                  </div>
                </div>
              </div>

              {/* Links */}
              <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                {navSections.map((section) => (
                  <div key={section.title} className="space-y-1.5">
                    <h3 className="px-3 text-[9px] font-bold text-neutral-550 uppercase tracking-widest">{section.title}</h3>
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.path;
                        return (
                          <Link
                            key={item.path}
                            href={item.path}
                            className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl border border-transparent transition-all duration-200 group ${
                              isActive
                                ? `${item.activeColor} shadow-md`
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40 hover:border-neutral-900/50'
                            }`}
                          >
                            <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? item.glowColor : 'text-neutral-500 group-hover:text-neutral-300'}`} />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </nav>

              {/* Bottom Actions */}
              <div className="p-4 border-t border-neutral-900">
                <button
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-red-400 bg-red-950/20 hover:bg-red-950/30 border border-red-900/20 rounded-xl transition duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* ── Scrollable Content Area ── */}
        <main className="flex-1 overflow-y-auto focus:outline-none bg-[#080808]">
          {children}
        </main>
      </div>

    </div>
  );
}
