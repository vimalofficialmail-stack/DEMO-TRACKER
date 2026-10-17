import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { exportDailyReportToPdf } from '../utils/pdfGenerator.ts';
import {
  User,
  ShieldCheck,
  Award,
  Save,
  Download,
  FileDown,
  Check,
  Database,
  LogIn,
  LogOut,
  RefreshCw,
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const {
    profile,
    updateProfile,
    allMetrics,
    currentMetrics,
    showToast,
    user,
    signInWithGoogle,
    logout,
    refreshCloudData,
  } = useApp();

  const [formData, setFormData] = useState({
    name: profile.name,
    employeeId: profile.employeeId,
    teamLead: profile.teamLead,
    batch: profile.batch,
    dailyTarget: profile.dailyTarget,
  });

  // Keep form fields synced when profile changes or resets
  React.useEffect(() => {
    setFormData({
      name: profile.name,
      employeeId: profile.employeeId,
      teamLead: profile.teamLead,
      batch: profile.batch,
      dailyTarget: profile.dailyTarget,
    });
  }, [profile]);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2200);
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allMetrics, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `demo_tracker_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Exported demo data successfully!');
  };

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-10">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Trainee Profile</h1>
        <p className="text-xs text-slate-500">Manage your profile, cloud database, and team reporting info</p>
      </div>

      {/* 2-column layout on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Trainee Profile Form (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-5">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0B4CA3]">
                <User className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Pre-Sales Trainee Profile</h2>
                <p className="text-[11px] text-slate-500">Information used to sign your daily EOD reports</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="trainee-name" className="block text-xs font-bold text-slate-700 mb-1">
                  Trainee Full Name
                </label>
                <input
                  id="trainee-name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0B4CA3] focus:ring-1 focus:ring-[#0B4CA3] focus:outline-none shadow-2xs"
                  placeholder="e.g. Vimal"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="trainee-id" className="block text-xs font-bold text-slate-700 mb-1">
                    Employee ID
                  </label>
                  <input
                    id="trainee-id"
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0B4CA3] focus:ring-1 focus:ring-[#0B4CA3] focus:outline-none shadow-2xs"
                    placeholder="e.g. EMP-101"
                  />
                </div>

                <div>
                  <label htmlFor="daily-target" className="block text-xs font-bold text-slate-700 mb-1">
                    Daily Demo Target
                  </label>
                  <input
                    id="daily-target"
                    type="number"
                    min="1"
                    required
                    value={formData.dailyTarget}
                    onChange={(e) => setFormData({ ...formData, dailyTarget: parseInt(e.target.value) || 10 })}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0B4CA3] focus:ring-1 focus:ring-[#0B4CA3] focus:outline-none shadow-2xs"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="team-lead" className="block text-xs font-bold text-slate-700 mb-1">
                  Team Lead (TL) Name
                </label>
                <input
                  id="team-lead"
                  type="text"
                  required
                  value={formData.teamLead}
                  onChange={(e) => setFormData({ ...formData, teamLead: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0B4CA3] focus:ring-1 focus:ring-[#0B4CA3] focus:outline-none shadow-2xs"
                  placeholder="e.g. Ankit Sharma"
                />
              </div>

              <div>
                <label htmlFor="batch-name" className="block text-xs font-bold text-slate-700 mb-1">
                  Batch / Pre-Sales Group
                </label>
                <input
                  id="batch-name"
                  type="text"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 focus:border-[#0B4CA3] focus:ring-1 focus:ring-[#0B4CA3] focus:outline-none shadow-2xs"
                  placeholder="e.g. Batch 2026-Q4 Pre-Sales"
                />
              </div>

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#0B4CA3] py-3 px-4 text-xs font-bold text-white shadow-sm hover:bg-[#093F8E] active:scale-[0.99] transition-all cursor-pointer"
              >
                {savedSuccess ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-300" />
                    <span>Profile Saved & Synced!</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Cloud Database, Attribution & Data Management (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* CLOUD DATABASE & AUTHENTICATION CARD */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Cloud Database & Auth</h2>
                  <p className="text-[10px] text-slate-500">Firebase Firestore Real-time Sync</p>
                </div>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Firestore Live</span>
              </span>
            </div>

            {/* Auth State */}
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 border border-slate-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0B4CA3] text-white font-bold text-sm overflow-hidden shrink-0">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="User avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span>{(user.displayName || user.email || 'U').slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {user.displayName || 'Authenticated Trainee'}
                      </span>
                      <span className="rounded-sm bg-blue-100 px-1.5 py-0.2 text-[9px] font-semibold text-blue-800">
                        Google
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                    <p className="text-[9px] text-slate-400 font-mono">UID: {user.uid.slice(0, 12)}...</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      await refreshCloudData();
                    }}
                    className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-semibold text-[#0B4CA3] hover:bg-blue-100 transition cursor-pointer"
                    title="Force refresh data from Firestore to sync across all devices"
                  >
                    <RefreshCw className="h-3.5 w-3.5 text-[#0B4CA3]" />
                    <span>Sync All Devices</span>
                  </button>

                  <button
                    type="button"
                    onClick={logout}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Sign in with your Google account to automatically synchronize demo records across your devices.
                </p>
                <button
                  type="button"
                  onClick={signInWithGoogle}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white border border-slate-300 py-2.5 px-4 text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-50 active:scale-[0.99] transition cursor-pointer"
                >
                  <LogIn className="h-4 w-4 text-[#0B4CA3]" />
                  <span>Sign in with Google</span>
                </button>
              </div>
            )}
          </div>

          {/* DEVELOPER SHOWCASE CARD */}
          <div className="relative overflow-hidden rounded-2xl border-2 border-blue-500/30 bg-gradient-to-br from-[#0B4CA3] via-[#1056B8] to-[#1D64F2] p-5 text-white shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs">
                  <Award className="h-5 w-5 text-[#FF9E00]" />
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-200">
                  Developer Attribution
                </span>
              </div>
              <span className="rounded-full bg-amber-400/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-400/30">
                OFFICIAL
              </span>
            </div>

            <div className="mt-3">
              <h3 className="text-lg font-black tracking-tight text-white">
                Developed by VIMAL GUPTA
              </h3>
              <p className="mt-1 text-xs text-blue-100 leading-relaxed">
                Crafted for Pre-Sales Trainees to accelerate daily demo bookings tracking, D0/D1 reporting, and 1-tap WhatsApp EOD generation.
              </p>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/15 pt-3 text-[11px] text-blue-200">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
                <span>Desktop & Mobile Optimized</span>
              </span>
              <span>•</span>
              <span>Firestore Sync</span>
            </div>
          </div>

          {/* Data Management Actions */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Data Management
            </h3>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  try {
                    exportDailyReportToPdf(currentMetrics, profile);
                    showToast('Daily Demo PDF report downloaded!');
                  } catch (err) {
                    console.error('PDF export error:', err);
                    showToast('Failed to generate PDF.');
                  }
                }}
                className="flex w-full items-center justify-between rounded-xl border border-blue-200 bg-blue-50/70 px-3.5 py-2.5 text-xs font-bold text-[#0B4CA3] hover:bg-blue-100/70 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <FileDown className="h-4 w-4 text-[#0B4CA3]" />
                  <span>Export Active Day Report (PDF)</span>
                </div>
                <span className="text-[10px] text-blue-600 font-semibold">PDF</span>
              </button>

              <button
                type="button"
                onClick={handleExportData}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-[#0B4CA3]" />
                  <span>Backup All Demo Data (JSON)</span>
                </div>
                <span className="text-[10px] text-slate-400">Download</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
