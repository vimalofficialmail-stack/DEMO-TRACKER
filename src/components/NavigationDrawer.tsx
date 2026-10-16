import React from 'react';
import { X, User, Database, Share2, Award, Calendar, LogIn, LogOut, Cloud, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { AppLogo } from './AppLogo.tsx';

export const NavigationDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    setIsDrawerOpen,
    profile,
    showToast,
    setActiveTab,
    user,
    signInWithGoogle,
    logout,
    isCloudSynced,
  } = useApp();

  if (!isDrawerOpen) return null;

  const handleShareApp = async () => {
    try {
      const shareData = {
        title: 'Pre-Sales Demo Tracker',
        text: 'Pre-Sales Trainee Daily Demo Report Tracker - Built by Vimal Gupta',
        url: window.location.href,
      };
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast('App link copied to clipboard!');
      }
    } catch {
      // ignore
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
      className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative flex h-full w-4/5 max-w-xs flex-col bg-white shadow-2xl animate-in slide-in-from-left duration-200">
        {/* Drawer Header in Deep Royal Blue */}
        <div className="bg-[#0B4CA3] p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <AppLogo size="sm" />
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/80 hover:bg-white/10 hover:text-white cursor-pointer"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* User / Trainee Card */}
          <div className="flex items-center gap-3 rounded-xl bg-white/10 p-3 backdrop-blur-xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#0B4CA3] font-extrabold text-base shadow-sm overflow-hidden shrink-0">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="User" className="h-full w-full object-cover" />
              ) : (
                <span>{profile.name ? profile.name.slice(0, 2).toUpperCase() : 'VG'}</span>
              )}
            </div>
            <div className="overflow-hidden min-w-0">
              <h3 id="drawer-title" className="text-sm font-bold text-white truncate">
                {user?.displayName || profile.name}
              </h3>
              <p className="text-[11px] text-blue-200 truncate">
                {user?.email || profile.employeeId}
              </p>
            </div>
          </div>

          {/* Cloud Database Status */}
          <div className="mt-2.5 flex items-center justify-between rounded-lg bg-black/20 px-2.5 py-1 text-[10px] font-medium text-blue-100">
            <span className="flex items-center gap-1">
              <Cloud className="h-3 w-3 text-emerald-300" />
              <span>Database: Firestore</span>
            </span>
            <span className="font-bold text-emerald-300">
              {isCloudSynced ? 'Connected' : 'Offline Mode'}
            </span>
          </div>
        </div>

        {/* Drawer Menu Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Auth Button */}
          {user ? (
            <button
              type="button"
              onClick={async () => {
                await logout();
                setIsDrawerOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out ({user.email})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={async () => {
                await signInWithGoogle();
                setIsDrawerOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50/80 px-3 py-2.5 text-xs font-bold text-[#0B4CA3] hover:bg-blue-100 transition cursor-pointer shadow-2xs"
            >
              <LogIn className="h-4 w-4" />
              <span>Sign In with Google</span>
            </button>
          )}

          <div className="pt-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3">
            Navigation
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveTab('history');
              setIsDrawerOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-blue-600" />
            <span>Past Daily Reports</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('settings');
              setIsDrawerOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <User className="h-4 w-4 text-purple-600" />
            <span>Trainee Profile & Database</span>
          </button>

          <button
            type="button"
            onClick={handleShareApp}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <Share2 className="h-4 w-4 text-slate-500" />
            <span>Share Tracker Link</span>
          </button>
        </div>

        {/* Drawer Footer: Developer Showcase */}
        <div className="border-t border-slate-100 bg-slate-50 p-4">
          <div className="rounded-xl border border-blue-100 bg-white p-3 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
              <Award className="h-4 w-4 text-[#FF7A00]" />
              <span>Developed by VIMAL GUPTA</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 leading-snug">
              Pre-Sales Trainee Daily Demo Report Tracker • Cloud Firestore & Auth
            </p>
          </div>
        </div>
      </div>

      {/* Backdrop click to close */}
      <div className="flex-1" onClick={() => setIsDrawerOpen(false)} />
    </div>
  );
};
