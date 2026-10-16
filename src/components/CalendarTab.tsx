import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { formatPillDate, calculateCompletionRate } from '../utils/reportGenerator.ts';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Check, ArrowRight } from 'lucide-react';

export const CalendarTab: React.FC = () => {
  const { allMetrics, selectedDate, setSelectedDate, setActiveTab, profile } = useApp();

  // Current view year and month (0-indexed)
  const [viewYear, setViewYear] = useState(() => {
    const [y] = selectedDate.split('-').map(Number);
    return y || new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    const [, m] = selectedDate.split('-').map(Number);
    return m !== undefined ? m - 1 : new Date().getMonth();
  });

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Calendar days computation
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();

  // Aggregate monthly stats
  let monthTotalBookings = 0;
  let monthCompletions = 0;
  let monthCancellations = 0;

  Object.entries(allMetrics).forEach(([dateStr, metrics]) => {
    const [y, m] = dateStr.split('-').map(Number);
    if (y === viewYear && m === viewMonth + 1) {
      monthTotalBookings += metrics.totalBookings || 0;
      monthCompletions += metrics.completions || 0;
      monthCancellations += metrics.cancellations || 0;
    }
  });

  const selectedDayMetrics = allMetrics[selectedDate];

  return (
    <div className="flex flex-col gap-4 p-4 pb-24">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">Demo Calendar</h1>
        <p className="text-xs text-slate-500">Day-by-day bookings and completions breakdown</p>
      </div>

      {/* Month Aggregates Header Card */}
      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-gradient-to-r from-[#0B4CA3] to-[#1D64F2] p-4 text-white shadow-sm">
        <div className="text-center">
          <span className="block text-xs font-semibold text-blue-200 uppercase">Bookings</span>
          <span className="text-2xl font-extrabold">{monthTotalBookings}</span>
        </div>
        <div className="text-center border-x border-white/20">
          <span className="block text-xs font-semibold text-emerald-200 uppercase">Completed</span>
          <span className="text-2xl font-extrabold text-emerald-300">{monthCompletions}</span>
        </div>
        <div className="text-center">
          <span className="block text-xs font-semibold text-rose-200 uppercase">Cancelled</span>
          <span className="text-2xl font-extrabold text-rose-200">{monthCancellations}</span>
        </div>
      </div>

      {/* Responsive layout: Calendar on left (7 cols on lg), Selected day on right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7">

      {/* Calendar Controls */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <h2 className="text-base font-bold text-slate-900">
              {monthNames[viewMonth]} {viewYear}
            </h2>
          </div>
          <button
            type="button"
            onClick={nextMonth}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2">
          {daysOfWeek.map((d) => (
            <div key={d}>{d}</div>
          ))}
        </div>

        {/* Day Cells Grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-12 rounded-xl bg-slate-50/50" />
          ))}

          {/* Actual days */}
          {Array.from({ length: totalDays }).map((_, idx) => {
            const dayNum = idx + 1;
            const mStr = String(viewMonth + 1).padStart(2, '0');
            const dStr = String(dayNum).padStart(2, '0');
            const dateStr = `${viewYear}-${mStr}-${dStr}`;
            const metrics = allMetrics[dateStr];
            const isSelected = selectedDate === dateStr;
            const hasData = Boolean(metrics && metrics.totalBookings > 0);

            return (
              <button
                key={dateStr}
                type="button"
                onClick={() => setSelectedDate(dateStr)}
                className={`relative flex h-13 flex-col items-center justify-between rounded-xl p-1 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'border-2 border-[#0B4CA3] bg-blue-50/90 shadow-sm'
                    : hasData
                    ? 'border border-emerald-200 bg-[#E9F8F2]/70 hover:bg-[#E9F8F2]'
                    : 'border border-slate-100 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <span
                  className={`text-[11px] font-bold ${
                    isSelected ? 'text-[#0B4CA3]' : 'text-slate-800'
                  }`}
                >
                  {dayNum}
                </span>

                {hasData && (
                  <div className="flex flex-col items-center w-full">
                    <span className="text-[10px] font-extrabold text-emerald-800 leading-tight">
                      {metrics.totalBookings}b
                    </span>
                    <span className="text-[9px] font-bold text-orange-600 leading-none flex items-center justify-center gap-0.5">
                      <Check className="h-2 w-2 shrink-0" strokeWidth={3} />
                      <span>{metrics.completions}</span>
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

        </div> {/* end lg:col-span-7 */}

        {/* Selected Day Quick Card in right column on desktop */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-[#0B4CA3]" />
                <h3 className="text-sm font-bold text-slate-900">
                  Selected: {formatPillDate(selectedDate)}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('home')}
                className="flex items-center gap-1 text-xs font-bold text-[#0B4CA3] hover:underline cursor-pointer"
              >
                <span>Open in Tracker</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            {selectedDayMetrics ? (
              <div className="mt-4">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="rounded-xl bg-[#E9F8F2] p-2.5">
                    <span className="block text-[10px] text-emerald-800 font-bold uppercase">Total</span>
                    <span className="text-lg font-extrabold text-emerald-900">
                      {selectedDayMetrics.totalBookings}
                    </span>
                  </div>
                  <div className="rounded-xl bg-[#EAF2FC] p-2.5">
                    <span className="block text-[10px] text-blue-800 font-bold uppercase">D0</span>
                    <span className="text-lg font-extrabold text-blue-900">
                      {selectedDayMetrics.todayD0}
                    </span>
                  </div>
                  <div className="rounded-xl bg-[#FEF3E7] p-2.5">
                    <span className="block text-[10px] text-orange-800 font-bold uppercase">Done</span>
                    <span className="text-lg font-extrabold text-orange-900">
                      {selectedDayMetrics.completions}
                    </span>
                  </div>
                  <div className="rounded-xl bg-[#FDECEE] p-2.5">
                    <span className="block text-[10px] text-rose-800 font-bold uppercase">Cancel</span>
                    <span className="text-lg font-extrabold text-rose-900">
                      {selectedDayMetrics.cancellations}
                    </span>
                  </div>
                </div>
                {selectedDayMetrics.remarks && (
                  <p className="mt-3 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                    "{selectedDayMetrics.remarks}"
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-4 text-center py-6 text-xs text-slate-500">
                No metrics logged yet for this date. Tap "Open in Tracker" to add.
              </div>
            )}
          </div>
        </div>
      </div> {/* end grid */}
    </div>
  );
};
