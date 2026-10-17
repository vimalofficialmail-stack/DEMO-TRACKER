import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { formatPillDate, calculateCompletionRate, generateWhatsAppReportText, getWhatsAppShareUrl } from '../utils/reportGenerator.ts';
import { WhatsAppIcon } from './WhatsAppIcon.tsx';
import { CompletionTrendsChart } from './CompletionTrendsChart.tsx';
import { MonthlyCompletionsBarChart } from './MonthlyCompletionsBarChart.tsx';
import { exportDailyReportToPdf } from '../utils/pdfGenerator.ts';
import { Calendar, Search, ArrowRight, CheckCircle2, AlertCircle, FileText, Share2, Layers, FileDown } from 'lucide-react';

export const HistoryTab: React.FC = () => {
  const { allMetrics, setSelectedDate, setActiveTab, profile, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  // Sort dates descending
  const sortedDates = Object.keys(allMetrics).sort((a, b) => b.localeCompare(a));

  const filteredDates = sortedDates.filter((dateStr) => {
    const formatted = formatPillDate(dateStr).toLowerCase();
    const remarks = (allMetrics[dateStr]?.remarks || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return formatted.includes(query) || remarks.includes(query) || dateStr.includes(query);
  });

  const handleSelectDay = (dateStr: string) => {
    setSelectedDate(dateStr);
    setActiveTab('home');
  };

  const handleShareDay = (dateStr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const metrics = allMetrics[dateStr];
    if (!metrics) return;
    const text = generateWhatsAppReportText(metrics, profile);
    window.open(getWhatsAppShareUrl(text), '_blank', 'noopener,noreferrer');
  };

  const handleDownloadDayPdf = (dateStr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const metrics = allMetrics[dateStr];
    if (!metrics) return;
    try {
      exportDailyReportToPdf(metrics, profile);
      showToast(`PDF report for ${dateStr} downloaded!`);
    } catch (err) {
      console.error('PDF error:', err);
      showToast('Error exporting PDF');
    }
  };

  return (
    <div className="flex flex-col gap-5 p-2 sm:p-4 pb-24">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900">Past Daily Reports & Trends</h1>
          <p className="text-xs text-slate-500">History feed of your daily demo logs, visual completion trends, and WhatsApp submissions</p>
        </div>
      </div>

      {/* Dashboard Section: Monthly Completed Demos Bar Chart */}
      <MonthlyCompletionsBarChart />

      {/* Completion Trends Chart Section (Recharts 7D / 30D) */}
      <CompletionTrendsChart />

      {/* Feed Section Title & Search Input */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-[#0B4CA3]" />
          <h2 className="text-sm font-bold text-slate-900">
            Logged Daily Entries ({filteredDates.length})
          </h2>
        </div>

        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search date or remarks..."
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#0B4CA3] focus:ring-1 focus:ring-[#0B4CA3] focus:outline-none shadow-xs"
          />
        </div>
      </div>

      {/* History Feed - 2 columns on desktop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDates.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-2xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-[#0B4CA3] mb-3">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No demo records logged yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Your logged daily reports will appear here in chronological order with completion metrics.
            </p>
            <button
              type="button"
              onClick={() => setActiveTab('home')}
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-[#0B4CA3] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#093F8E] transition cursor-pointer"
            >
              <span>Go to Dashboard to Log</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          filteredDates.map((dateStr) => {
            const metrics = allMetrics[dateStr];
            const completionRate = calculateCompletionRate(metrics.completions, metrics.todayD0);
            const isCompletedTarget = metrics.totalBookings >= profile.dailyTarget;

            return (
              <div
                key={dateStr}
                onClick={() => handleSelectDay(dateStr)}
                className="group relative cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs hover:border-[#0B4CA3]/40 hover:shadow-md transition-all"
              >
                {/* Header Row */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0B4CA3]">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0B4CA3] transition-colors">
                        {formatPillDate(dateStr)}
                      </h3>
                      <span className="text-[10px] text-slate-400">Date key: {dateStr}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        completionRate >= 80
                          ? 'bg-emerald-100 text-emerald-800'
                          : completionRate >= 50
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {completionRate}% Done
                    </span>
                  </div>
                </div>

                {/* Metrics Badges Row */}
                <div className="mt-3 grid grid-cols-5 gap-1.5 text-center">
                  <div className="rounded-lg bg-[#E9F8F2] p-1.5">
                    <span className="block text-[10px] font-bold text-emerald-800">Total</span>
                    <span className="text-sm font-extrabold text-emerald-900">{metrics.totalBookings}</span>
                  </div>
                  <div className="rounded-lg bg-[#EAF2FC] p-1.5">
                    <span className="block text-[10px] font-bold text-blue-800">Today D0</span>
                    <span className="text-sm font-extrabold text-blue-900">{metrics.todayD0}</span>
                  </div>
                  <div className="rounded-lg bg-[#F2EDFC] p-1.5">
                    <span className="block text-[10px] font-bold text-purple-800">D1</span>
                    <span className="text-sm font-extrabold text-purple-900">{metrics.tomorrowD1}</span>
                  </div>
                  <div className="rounded-lg bg-[#FEF3E7] p-1.5">
                    <span className="block text-[10px] font-bold text-orange-800">Done</span>
                    <span className="text-sm font-extrabold text-orange-900">{metrics.completions}</span>
                  </div>
                  <div className="rounded-lg bg-[#FDECEE] p-1.5">
                    <span className="block text-[10px] font-bold text-rose-800">Cancel</span>
                    <span className="text-sm font-extrabold text-rose-900">{metrics.cancellations}</span>
                  </div>
                </div>

                {/* Remarks snippet if available */}
                {metrics.remarks && (
                  <div className="mt-2.5 rounded-lg bg-slate-50 p-2 text-xs text-slate-600 line-clamp-1 italic">
                    "{metrics.remarks}"
                  </div>
                )}

                {/* Actions row */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-50 text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => handleShareDay(dateStr, e)}
                      className="flex items-center gap-1 font-semibold text-[#25D366] hover:underline cursor-pointer"
                    >
                      <WhatsAppIcon size={14} />
                      <span>WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDownloadDayPdf(dateStr, e)}
                      className="flex items-center gap-1 font-semibold text-[#0B4CA3] hover:underline cursor-pointer"
                      title="Download PDF report"
                    >
                      <FileDown size={14} />
                      <span>PDF</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1 font-semibold text-[#0B4CA3] group-hover:translate-x-0.5 transition-transform">
                    <span>Edit Day</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
