import React, { useState } from 'react';
import { DatePill } from './DatePill.tsx';
import { MetricCard } from './MetricCard.tsx';
import { DailyRemarks } from './DailyRemarks.tsx';
import { WhatsAppIcon } from './WhatsAppIcon.tsx';
import { useApp } from '../context/AppContext.tsx';
import { generateWhatsAppReportText, getWhatsAppShareUrl } from '../utils/reportGenerator.ts';
import { Copy, Check, Share2, Sparkles, Award, Target, TrendingUp, Cloud, RefreshCw } from 'lucide-react';

export const HomeTab: React.FC = () => {
  const {
    setIsReportModalOpen,
    currentMetrics,
    profile,
    showToast,
    user,
    isCloudSynced,
    refreshCloudData,
  } = useApp();
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualSync = async () => {
    setIsRefreshing(true);
    await refreshCloudData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const reportText = generateWhatsAppReportText(currentMetrics, profile);
  const shareUrl = getWhatsAppShareUrl(reportText);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText);
      setCopied(true);
      showToast('EOD Report copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Could not copy automatically. Please copy the text directly.');
    }
  };

  const handleShare = () => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full pb-20 md:pb-10 pt-1">
      {/* Date Dropdown Pill: Centered floating rounded white card */}
      <DatePill />

      {/* Cloud Sync Status Indicator (when signed in) */}
      {user && (
        <div className="mt-1 mx-4 sm:mx-0 flex items-center justify-between gap-2 px-1 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-slate-700">
              Synced across devices as <span className="font-bold text-[#0B4CA3]">{user.displayName || user.email}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={handleManualSync}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1 font-semibold text-[#0B4CA3] hover:underline cursor-pointer disabled:opacity-50"
            title="Force refresh live data from Firestore across all devices"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      )}

      {/* Responsive Grid: 1 column on mobile, 2 columns on desktop (12 cols: 7 left, 5 right) */}
      <div className="mt-2 grid grid-cols-1 lg:grid-cols-12 gap-5 px-4 sm:px-0">
        {/* Left Side: 2x2 Grid + 5th Full Width Card + Remarks */}
        <div className="lg:col-span-7 flex flex-col gap-3.5">
          {/* 2x2 Grid Layout for Top 4 Metrics */}
          <div className="grid grid-cols-2 gap-3">
            {/* Metric 1: Total Demo Booking - Soft pastel mint green (#E9F8F2) */}
            <MetricCard metricKey="totalBookings" />

            {/* Metric 2: Booking for Today (D0) - Soft pastel blue (#EAF2FC) */}
            <MetricCard metricKey="todayD0" />

            {/* Metric 3: Bookings for Tomorrow (D1) - Soft pastel lavender (#F2EDFC) */}
            <MetricCard metricKey="tomorrowD1" />

            {/* Metric 4: Demo Completions - Soft pastel peach (#FEF3E7) */}
            <MetricCard metricKey="completions" />
          </div>

          {/* Full-Width 5th Metric Card: Demo Cancellations - Soft pastel rose/pink (#FDECEE) */}
          <MetricCard metricKey="cancellations" isFullWidth />

          {/* Daily Remarks: Outlined rounded text area with placeholder */}
          <DailyRemarks />

          {/* Mobile-only Primary Action Button (On desktop, the right panel has the action buttons) */}
          <div className="lg:hidden pt-1">
            <button
              type="button"
              onClick={() => setIsReportModalOpen(true)}
              className="group relative flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#1D64F2] py-3.5 px-6 text-sm font-bold text-white shadow-[0_6px_20px_rgba(29,100,242,0.32)] hover:bg-[#1554D1] active:scale-[0.98] transition-all cursor-pointer"
              aria-label="Generate EOD Report"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 group-hover:scale-110 transition-transform">
                <WhatsAppIcon size={16} className="text-white" />
              </div>
              <span className="tracking-tight text-sm font-bold">Generate EOD Report</span>
            </button>
          </div>
        </div>

        {/* Right Side on Desktop: Dedicated Live WhatsApp EOD Report Panel & Quick Actions */}
        <div className="hidden lg:flex lg:col-span-5 flex-col gap-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            {/* Panel Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <WhatsAppIcon size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Generated EOD Report</h2>
                  <p className="text-[11px] text-slate-400">Live preview matching exact team format</p>
                </div>
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-[#0B4CA3]">
                Auto-Synced
              </span>
            </div>

            {/* Formatted Report Card (WhatsApp bubble style) */}
            <div className="my-4 rounded-2xl border border-[#DAD3C8] bg-[#EFEAE2]/60 p-4">
              <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase text-emerald-800">
                <span className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Exact EOD Output
                </span>
                <span className="text-[10px] text-slate-400 font-normal">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed text-slate-900 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs select-all">
                {reportText}
              </pre>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleShare}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] py-3 px-4 text-xs font-bold text-white shadow-sm hover:bg-[#20BE5B] active:scale-[0.99] transition-all cursor-pointer"
              >
                <WhatsAppIcon size={18} className="text-white" />
                <span>Share via WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-100 active:scale-[0.99] transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-slate-600" />
                    <span>Copy Report Text</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Desktop Developer Attribution Box */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Award className="h-4 w-4 text-[#FF7A00]" />
                <span>Developed by VIMAL GUPTA</span>
              </div>
              <span className="rounded-full bg-[#0B4CA3] px-2 py-0.5 text-[9px] font-bold text-white">
                Pre-Sales Operations
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500 leading-snug">
              Trainee Daily Demo Report Tracker • Optimized for Desktop & Mobile
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Developer Signature */}
      <div className="lg:hidden pt-3 text-center">
        <p className="text-[10px] font-semibold tracking-wide text-slate-400">
          ⚡ Developed by <span className="text-[#0B4CA3] font-bold">VIMAL GUPTA</span>
        </p>
      </div>
    </div>
  );
};
