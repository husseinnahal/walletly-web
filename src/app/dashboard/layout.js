'use client';

import {
  ArrowLeftRight,
  Bell,
  Bot,
  Calendar,
  CircleHelp,
  Coins,
  LineChart,
  LogOut,
  Menu,
  MessageSquare,
  PieChart,
  Scale,
  Settings,
  Shield,
  Target,
  TrendingUp,
  Trophy,
  User,
  Wallet,
  X
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import statsIcon from '../../../assets/icons/stats.svg';
import userIcon from '../../../assets/icons/user.svg';
import billsAsset from '../../../assets/images/bills.png';
import budgetsAsset from '../../../assets/images/budgets.png';
import challengeAsset from '../../../assets/images/challenges/coiny_challenge.png';
import chatbotAsset from '../../../assets/images/coinyChatbot.png';
import coinyOpenAsset from '../../../assets/images/coinyOpen.png';
import coinyWavingAsset from '../../../assets/images/coinyWaving.png';
import debtsAsset from '../../../assets/images/debts.png';
import fateAsset from '../../../assets/images/fate.png';
import flowAsset from '../../../assets/images/flow.png';
import investAsset from '../../../assets/images/invest.png';
import logoAsset from '../../../assets/images/logo.png';
import metalsAsset from '../../../assets/images/metals.png';
import savingsAsset from '../../../assets/images/savings.png';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/api';

export default function DashboardLayout({ children }) {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [featureProgress, setFeatureProgress] = useState(null);

  // Notification states & helpers
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await apiFetch('/notifications');
      if (res.success) {
        setNotifications(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const markNotificationRead = async (id) => {
    try {
      await apiFetch(`/notifications/${id}/read`, { method: 'DELETE' });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await apiFetch('/notifications/mark-all-read', { method: 'DELETE' });
      setNotifications([]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    // Wait until auth check is complete before redirecting.
    if (!authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router]);

  const navSections = [
    {
      title: 'Finance & Planning',
      items: [
        { label: 'Transactions', path: '/dashboard/transactions', icon: ArrowLeftRight, visual: flowAsset, activeColor: 'bg-[#6be6b0]/5 text-[#6be6b0] border-[#6be6b0]/20', glowColor: 'text-[#6be6b0]' },
        { label: 'Budgets', path: '/dashboard/budgets', icon: PieChart, visual: budgetsAsset, activeColor: 'bg-[#6be6b0]/5 text-[#6be6b0] border-[#6be6b0]/20', glowColor: 'text-[#6be6b0]' },
        { label: 'Savings Goals', path: '/dashboard/savings', icon: Target, visual: savingsAsset, activeColor: 'bg-[#EA7108]/5 text-[#EA7108] border-[#EA7108]/20', glowColor: 'text-[#EA7108]' },
        { label: 'Debt & Credit', path: '/dashboard/debt', icon: Scale, visual: debtsAsset, activeColor: 'bg-[#EA7108]/5 text-[#EA7108] border-[#EA7108]/20', glowColor: 'text-[#EA7108]' },
        { label: 'Bills & Payments', path: '/dashboard/bills', icon: Calendar, visual: billsAsset, activeColor: 'bg-[#6be6b0]/5 text-[#6be6b0] border-[#6be6b0]/20', glowColor: 'text-[#6be6b0]' },
        { label: 'My Accounts', path: '/dashboard/accounts', icon: Wallet, activeColor: 'bg-neutral-800 text-white border-neutral-700', glowColor: 'text-white' },
        { label: 'Stats Overview', path: '/dashboard/statistics', icon: TrendingUp, visual: statsIcon, activeColor: 'bg-[#EA7108]/5 text-[#EA7108] border-[#EA7108]/20', glowColor: 'text-[#EA7108]' },
      ]
    },
    {
      title: 'Wealth & Assets',
      items: [
        { label: 'Metal Assets', path: '/dashboard/metals', icon: Coins, visual: metalsAsset, activeColor: 'bg-[#EA7108]/5 text-[#EA7108] border-[#EA7108]/20', glowColor: 'text-[#EA7108]' },
        { label: 'Investments', path: '/dashboard/investments', icon: LineChart, visual: investAsset, activeColor: 'bg-[#6be6b0]/5 text-[#6be6b0] border-[#6be6b0]/20', glowColor: 'text-[#6be6b0]' },
      ]
    },
    {
      title: 'Tools & AI',
      items: [
        { label: 'Play & Earn', path: '/dashboard/gamification', icon: Trophy, visual: challengeAsset, activeColor: 'bg-[#EA7108]/5 text-[#EA7108] border-[#EA7108]/20', glowColor: 'text-[#EA7108]' },
        { label: 'Fate Ball', path: '/dashboard/fate', icon: CircleHelp, visual: fateAsset, activeColor: 'bg-[#EA7108]/5 text-[#EA7108] border-[#EA7108]/20', glowColor: 'text-[#EA7108]' },
        { label: 'Coiny', path: '/dashboard/chatbot', icon: Bot, visual: chatbotAsset, activeColor: 'bg-[#6be6b0]/5 text-[#6be6b0] border-[#6be6b0]/20', glowColor: 'text-[#6be6b0]' },
        { label: 'Peer Chat', path: '/dashboard/chat', icon: MessageSquare, activeColor: 'bg-[#6be6b0]/5 text-[#6be6b0] border-[#6be6b0]/20', glowColor: 'text-[#6be6b0]' },
      ]
    },
    {
      title: 'Security & Preferences',
      items: [
        { label: 'App Security', path: '/dashboard/security', icon: Shield, activeColor: 'bg-neutral-850 text-neutral-200 border-neutral-800', glowColor: 'text-neutral-250' },
        { label: 'Settings & Profile', path: '/dashboard', icon: User, visual: userIcon, activeColor: 'bg-[#6be6b0]/5 text-[#6be6b0] border-[#6be6b0]/20', glowColor: 'text-[#6be6b0]' },
      ]
    }
  ];

  const featureMetas = [
    { path: '/dashboard/transactions', title: 'Transactions', subtitle: 'Track daily money flow with Coiny by your side.', visual: flowAsset, icon: ArrowLeftRight, accent: '#6be6b0' },
    { path: '/dashboard/budgets', title: 'Budgets', subtitle: 'Watch your spending limits and renewal progress.', visual: budgetsAsset, icon: PieChart, accent: '#6be6b0', progressLabel: 'Budget Usage' },
    { path: '/dashboard/savings', title: 'Savings Goals', subtitle: 'Build each goal step by step with Coiny progress.', visual: savingsAsset, icon: Target, accent: '#EA7108', progressLabel: 'Savings Progress' },
    { path: '/dashboard/debt', title: 'Debt & Credit', subtitle: 'Keep payables, receivables, and repayment progress clear.', visual: debtsAsset, icon: Scale, accent: '#EA7108' },
    { path: '/dashboard/bills', title: 'Bills & Payments', subtitle: 'Stay ahead of due dates and recurring obligations.', visual: billsAsset, icon: Calendar, accent: '#6be6b0' },
    { path: '/dashboard/accounts', title: 'My Accounts', subtitle: 'See your liquidity and movement across wallets.', icon: Wallet, accent: '#6be6b0' },
    { path: '/dashboard/statistics', title: 'Stats Overview', subtitle: 'Turn your Walletly activity into readable insights.', visual: statsIcon, icon: TrendingUp, accent: '#EA7108' },
    { path: '/dashboard/metals', title: 'Metal Assets', subtitle: 'Follow gold and silver holdings with live portfolio energy.', visual: metalsAsset, icon: Coins, accent: '#EA7108' },
    { path: '/dashboard/investments', title: 'Investments', subtitle: 'Keep assets and opportunities organized in one view.', visual: investAsset, icon: LineChart, accent: '#6be6b0' },
    { path: '/dashboard/gamification', title: 'Play & Earn', subtitle: 'Complete challenges, earn coins, and grow your streak.', visual: challengeAsset, icon: Trophy, accent: '#EA7108' },
    { path: '/dashboard/fate', title: 'Fate Ball', subtitle: 'Let Coiny help you choose when decisions feel stuck.', visual: fateAsset, icon: CircleHelp, accent: '#EA7108' },
    { path: '/dashboard/chatbot', title: 'Coiny', subtitle: 'Ask Coiny to help log, explain, and understand your money.', visual: chatbotAsset, icon: Bot, accent: '#6be6b0' },
    { path: '/dashboard/chat', title: 'Peer Chat', subtitle: 'Chat with other Walletly users directly in real-time.', icon: MessageSquare, accent: '#6be6b0' },
    { path: '/dashboard/security', title: 'App Security', subtitle: 'Protect your Walletly space and account preferences.', visual: coinyWavingAsset, icon: Shield, accent: '#6be6b0' },
    { path: '/dashboard/settings', title: 'Settings', subtitle: 'Tune your Walletly preferences for the way you manage money.', visual: coinyOpenAsset, icon: Settings, accent: '#6be6b0' },
    { path: '/dashboard', title: 'Settings & Profile', subtitle: 'Manage profile details, categories, security, and currency.', visual: userIcon, icon: User, accent: '#6be6b0' },
  ];

  const activeFeature = featureMetas
    .filter((feature) => pathname === feature.path || (feature.path !== '/dashboard' && pathname.startsWith(`${feature.path}/`)))
    .sort((a, b) => b.path.length - a.path.length)[0] || featureMetas[featureMetas.length - 1];
  const ActiveFeatureIcon = activeFeature.icon || Wallet;
  const showsBackendProgress = activeFeature.path === '/dashboard/budgets' || activeFeature.path === '/dashboard/savings';
  const activeProgress = Math.min(Math.max(Number(featureProgress) || 0, 0), 100);

  const loadFeatureProgress = useCallback(async () => {
    if (!user || !showsBackendProgress) {
      setFeatureProgress(null);
      return;
    }

    try {
      if (activeFeature.path === '/dashboard/budgets') {
        const res = await apiFetch('/budgets');
        const budgets = res.data?.budgets || [];
        const totalLimit = budgets.reduce((sum, budget) => sum + (Number(budget.amount) || 0), 0);
        const totalSpent = budgets.reduce((sum, budget) => sum + (Number(budget.spent) || 0), 0);
        setFeatureProgress(totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0);
        return;
      }

      if (activeFeature.path === '/dashboard/savings') {
        const res = await apiFetch('/savings');
        const savings = res.data || {};
        const totalTarget = Number(savings.totalTarget) || 0;
        const totalSaved = Number(savings.totalSaved) || 0;
        setFeatureProgress(totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0);
      }
    } catch {
      setFeatureProgress(0);
    }
  }, [activeFeature.path, showsBackendProgress, user]);

  useEffect(() => {
    loadFeatureProgress();
  }, [loadFeatureProgress]);

  useEffect(() => {
    window.addEventListener('walletly-feature-progress-refresh', loadFeatureProgress);
    return () => window.removeEventListener('walletly-feature-progress-refresh', loadFeatureProgress);
  }, [loadFeatureProgress]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-walletly-theme flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-[#6be6b0]" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="walletly-shell bg-walletly-theme flex h-screen text-neutral-100 overflow-hidden font-sans">
      
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0e0e0e] border-r border-neutral-900 shrink-0">
        {/* Brand Header */}
        <div className="p-6 border-b border-neutral-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#6be6b0] to-[#EA7108] rounded-2xl flex items-center justify-center text-black font-extrabold shadow-lg shadow-[#6be6b0]/10">
            <Image src={logoAsset} alt="Walletly Logo" width={20} height={20} className="object-contain" />
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
            {/* Notification Bell with Badge */}
            <div className="relative ml-2">
              <button 
                onClick={() => setShowNotifications(true)}
                className={`p-2 rounded-xl transition relative border ${showNotifications ? 'bg-neutral-800 border-neutral-700 text-[#6be6b0]' : 'border-transparent text-neutral-400 hover:text-white hover:bg-neutral-900'}`}
                title="Notifications"
              >
                <Bell className="w-4.5 h-4.5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 flex items-center justify-center bg-red-500 text-white text-[9px] font-black rounded-full px-1.5 border-2 border-[#0e0e0e] shadow-sm animate-bounce">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation list divided in sections */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6 scrollbar-thin">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-2">
              <h3 className="px-3 text-[10px] font-bold text-neutral-555 uppercase tracking-widest">{section.title}</h3>
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
                      {item.visual ? (
                        <span className={`relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border transition-transform duration-200 group-hover:scale-105 ${
                          isActive ? 'border-current bg-white/8' : 'border-white/5 bg-white/5'
                        }`}>
                          <Image src={item.visual} alt="" fill sizes="28px" className="object-contain p-1" />
                        </span>
                      ) : (
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                          <Icon className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? item.glowColor : 'text-neutral-500 group-hover:text-neutral-300'}`} />
                        </span>
                      )}
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

          <div className="flex items-center gap-2">
            {/* Mobile Notification Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(true)}
                className={`p-2 rounded-xl transition border ${showNotifications ? 'bg-neutral-800 border-neutral-700 text-[#6be6b0]' : 'border-transparent text-neutral-400 hover:text-white bg-neutral-900'}`}
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 flex items-center justify-center bg-red-500 text-white text-[8px] font-black rounded-full px-1 border border-[#0e0e0e] shadow-sm animate-bounce">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>

            <button
              onClick={() => setIsMobileOpen(true)}
              className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 rounded-xl border border-neutral-805 transition"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
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
                      <Image src={user.avatar} alt="Avatar" width={36} height={36} className="rounded-full object-cover w-9.5 h-9.5 border border-neutral-850" />
                    ) : (
                      <div className="w-9.5 h-9.5 bg-gradient-to-br from-[#6be6b0] to-[#EA7108] rounded-full flex items-center justify-center text-black font-black text-xs">{user?.username?.[0]?.toUpperCase()}</div>
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
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-xl border border-transparent transition-all duration-200 group ${
                              isActive
                                ? `${item.activeColor} shadow-md`
                                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/40 hover:border-neutral-900/50'
                            }`}
                          >
                            {item.visual ? (
                              <span className={`relative flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-lg border transition-transform duration-200 group-hover:scale-105 ${
                                isActive ? 'border-current bg-white/8' : 'border-white/5 bg-white/5'
                              }`}>
                                <Image src={item.visual} alt="" fill sizes="28px" className="object-contain p-1" />
                              </span>
                            ) : (
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center">
                                <Icon className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? item.glowColor : 'text-neutral-500 group-hover:text-neutral-300'}`} />
                              </span>
                            )}
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
        <main className="flex-1 overflow-y-auto focus:outline-none bg-transparent" data-feature-path={activeFeature.path}>
          <section className="walletly-feature-hero mx-auto mt-5 w-[min(1120px,calc(100%-2rem))] px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4 min-w-0">
                <div className="walletly-feature-image">
                  {activeFeature.visual ? (
                    <Image src={activeFeature.visual} alt="" fill sizes="112px" className="object-contain p-2" priority />
                  ) : (
                    <ActiveFeatureIcon className="walletly-feature-icon" strokeWidth={2.4} />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{activeFeature.title}</h2>
                  <p className="mt-1 max-w-xl text-sm font-medium text-slate-300/75">{activeFeature.subtitle}</p>
                </div>
              </div>

              {showsBackendProgress && (
              <div className="walletly-coiny-progress" style={{ '--feature-accent': activeFeature.accent }}>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{activeFeature.progressLabel}</p>
                    <p className="mt-1 text-lg font-black text-white">{activeProgress}%</p>
                  </div>
                  <div className="relative h-12 w-12 shrink-0">
                    <Image src={coinyWavingAsset} alt="" fill sizes="48px" className="object-contain" />
                  </div>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-[var(--feature-accent)] shadow-[0_0_18px_var(--feature-accent)]" style={{ width: `${activeProgress}%` }} />
                </div>
              </div>
              )}
            </div>
          </section>
          {children}
        </main>
      </div>

      {/* Backdrop overlay */}
      {showNotifications && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity animate-fade-in"
          onClick={() => setShowNotifications(false)}
        />
      )}

      {/* Sliding Full-Height Notification Drawer */}
      {showNotifications && (
        <div className="fixed inset-0 z-[100] w-[100vw] h-[100vh] overflow-hidden">
          {/* Dark blurred background */}
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setShowNotifications(false)}
            className="absolute inset-0 bg-black/20 backdrop-blur-[5px] "
          />

          {/* Notification Drawer */}
          <aside
            className="
              absolute inset-y-0 right-0
              flex h-dvh w-[400px] max-w-[92vw] flex-col
              border-l border-white/5
              bg-[#090a0a]
              shadow-[-20px_0_60px_rgba(0,0,0,0.55)]
              animate-slide-in-right
            "
          >
            {/* Header */}
            <div className="flex min-h-[96px] items-center justify-between border-b border-white/5 px-7 py-5">
              <div>
                <h3 className="text-base font-black uppercase tracking-wide text-white">
                  Notification Hub
                </h3>

                <p className="mt-1 text-[11px] font-medium text-neutral-500">
                  {notifications.length} unread alerts
                </p>
              </div>

              <div className="flex items-center gap-4">
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllNotifications}
                    className="
                      text-[10px] font-black uppercase tracking-widest
                      text-red-400 transition-colors
                      hover:text-red-300
                    "
                  >
                    Clear All
                  </button>
                )}

                <button
                  type="button"
                  aria-label="Close notifications"
                  onClick={() => setShowNotifications(false)}
                  className="
                    flex h-10 w-10 items-center justify-center
                    rounded-full bg-[#181818]
                    text-neutral-500 transition
                    hover:bg-neutral-800 hover:text-white
                  "
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Notifications */}
            <div className="flex-1 space-y-3 overflow-y-auto px-6 py-7 scrollbar-thin">
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <article
                    key={notification._id}
                    className="
                      group relative flex gap-4
                      rounded-[18px] border border-white/10
                      bg-[#0b0c0c] px-5 py-5
                      transition-all duration-200
                      hover:border-white/20 hover:bg-[#101111]
                      animate-slide-up
                    "
                  >
                    {/* Icon */}
                    <div className="flex h-9 w-9 shrink-0 items-start justify-center pt-0.5 text-[25px]">
                      {notification.icon || "🔔"}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 pr-5">
                      <h5 className="mb-1.5 text-[13px] font-black leading-snug text-white">
                        {notification.title}
                      </h5>

                      <p className="text-[11px] leading-[1.6] text-neutral-400">
                        {notification.description}
                      </p>

                      <time className="mt-3 block text-[9px] font-black uppercase text-neutral-300">
                        {new Date(notification.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "numeric",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}{" "}
                        {new Date(notification.createdAt).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </time>
                    </div>

                    {/* Remove notification */}
                    <button
                      type="button"
                      aria-label="Remove notification"
                      onClick={() => markNotificationRead(notification._id)}
                      className="
                        absolute right-4 top-4
                        text-neutral-600 opacity-0
                        transition-all
                        hover:text-red-400
                        group-hover:opacity-100
                      "
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </article>
                ))
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-5 text-center">
                  <span className="mb-4 text-5xl">🔔</span>

                  <p className="text-sm font-bold text-neutral-300">
                    No notifications found
                  </p>

                  <p className="mt-2 max-w-[240px] text-[11px] leading-relaxed text-neutral-500">
                    We will let you know when new transactions, budget alerts, or
                    messages arrive.
                  </p>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

    </div>
  );
}
