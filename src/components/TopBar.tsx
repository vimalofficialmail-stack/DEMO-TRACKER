import React from 'react';
import { Menu, Calendar, Cloud, Home, History, Settings as SettingsIcon, LogIn, ChevronDown } from 'lucide-react';
import { AppLogo } from './AppLogo.tsx';
import { useApp } from '../context/AppContext.tsx';
import { formatPillDate } from '../utils/reportGenerator.ts';

export const TopBar: React.FC = () => {
  const {
    setIsDrawerOpen,
    setIsDatePickerOpen,
    user,
    isCloudSynced,
    signInWithGoogle,
    activeTab,
    setActiveTab,
    selectedDate,
  } = useApp();

  const formattedDate = formatPillDate(selectedDate);

  const navItems = [
    { id: 'home' as const, label: 'Dashboard', icon: Home },
    { id: 'history' as const, label: 'Past Reports', icon: History },
    { id: 'calendar' as const, label: 'Calendar', icon: Calendar },
    { id: 'settings' as const, label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <header className="sticky top-0 z-30 w-full bg-[#0B4CA3] text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Left: Mobile Hamburger & Brand Logo */}
        <div className="flex items-center gap-3">
          {/* Hamburger Menu (Mobile & Desktop quick access) */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 active:scale-95 transition-transform cursor-pointer"
            aria-label="Open menu drawer"
            title="Open menu"
          >
            <Menu className="h-6 w-6" strokeWidth={2.5} />
          </button>

          {/* Brand Logo with Cloud Sync Status Indicator */}
          <div className="flex items-center gap-2">
            <AppLogo size="md" />
            <span className="hidden lg:inline-flex items-center rounded-full bg-blue-800/80 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-blue-200 border border-blue-400/20 uppercase">
              Pre-Sales Ops
            </span>
          </div>
        </div>

        {/* Center: Desktop Navigation Tabs (Visible on md and larger) */}
        <nav className="hidden md:flex items-center gap-1 bg-[#093F8E]/80 p-1 rounded-xl border border-blue-400/20 shadow-inner">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#0B4CA3] shadow-xs'
                    : 'text-blue-100 hover:bg-white/10 hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Date selector, Cloud Sync & User Profile */}
        <div className="flex items-center gap-2">
          {/* Desktop Quick Date Pill Trigger */}
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(true)}
            className="hidden sm:flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25 active:scale-95 transition cursor-pointer border border-white/10 shadow-xs"
            title="Click to change date"
          >
            <Calendar className="h-3.5 w-3.5 text-blue-200" />
            <span>{formattedDate}</span>
            <ChevronDown className="h-3.5 w-3.5 text-blue-200" />
          </button>

          {/* Cloud Database Indicator */}
          <div
            className="flex items-center gap-1.5 rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-medium text-blue-100"
            title={isCloudSynced ? 'Connected to Firebase Firestore' : 'Running in local cache mode'}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isCloudSynced ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className="hidden xl:inline text-[10px]">
              {isCloudSynced ? 'Firestore Live' : 'Offline'}
            </span>
          </div>

          {/* Auth Button / Profile Avatar */}
          {user ? (
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white hover:ring-2 hover:ring-white/50 transition cursor-pointer overflow-hidden shadow-xs"
              title={`Signed in as ${user.displayName || user.email}`}
              aria-label={`Account profile for ${user.displayName || 'Trainee'}`}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="User avatar" className="h-full w-full object-cover" />
              ) : (
                <span>{(user.displayName || user.email || 'U').slice(0, 1).toUpperCase()}</span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-[#0B4CA3] hover:bg-blue-50 active:scale-95 transition cursor-pointer shadow-xs"
              title="Sign in with Google to sync across devices"
              aria-label="Sign in with Google"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Mobile Calendar Trigger button (hidden on desktop where date pill is visible) */}
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(true)}
            className="sm:hidden flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 active:scale-95 transition cursor-pointer"
            aria-label="Select date"
          >
            <Calendar className="h-6 w-6" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </header>
  );
};
