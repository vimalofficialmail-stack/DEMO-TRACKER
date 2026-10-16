import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Check } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatPillDate } from '../utils/reportGenerator.ts';

export const DatePickerModal: React.FC = () => {
  const { isDatePickerOpen, setIsDatePickerOpen, selectedDate, setSelectedDate } = useApp();
  const [inputDate, setInputDate] = useState(selectedDate);

  if (!isDatePickerOpen) return null;

  const handleSelect = (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsDatePickerOpen(false);
  };

  const formatDateStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = formatDateStr(new Date());

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = formatDateStr(yesterday);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatDateStr(tomorrow);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="date-picker-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2 text-[#0B4CA3]">
            <CalendarIcon className="h-5 w-5" />
            <h3 id="date-picker-title" className="text-sm font-bold text-slate-900">
              Select Demo Tracker Date
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setIsDatePickerOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            aria-label="Close date picker"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Quick Date Buttons - Production Ready */}
        <div className="my-4 flex flex-col gap-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Quick Select
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleSelect(yesterdayStr)}
              className={`rounded-xl border px-3 py-2 text-center text-xs font-semibold transition cursor-pointer ${
                selectedDate === yesterdayStr
                  ? 'border-[#0B4CA3] bg-blue-50 text-[#0B4CA3]'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="block font-bold">Yesterday</span>
              <span className="text-[10px] text-slate-500">{formatPillDate(yesterdayStr).split(',')[0]}</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelect(todayStr)}
              className={`rounded-xl border px-3 py-2 text-center text-xs font-semibold transition cursor-pointer ${
                selectedDate === todayStr
                  ? 'border-[#0B4CA3] bg-blue-50 text-[#0B4CA3]'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="block font-bold">Today</span>
              <span className="text-[10px] text-slate-500">Active</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelect(tomorrowStr)}
              className={`rounded-xl border px-3 py-2 text-center text-xs font-semibold transition cursor-pointer ${
                selectedDate === tomorrowStr
                  ? 'border-[#0B4CA3] bg-blue-50 text-[#0B4CA3]'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="block font-bold">Tomorrow</span>
              <span className="text-[10px] text-slate-500">D1 Plan</span>
            </button>
          </div>
        </div>

        {/* Native Calendar Picker Input */}
        <div className="pt-2">
          <label htmlFor="custom-date-picker" className="block text-xs font-bold text-slate-700 mb-1.5">
            Pick Custom Date
          </label>
          <div className="flex gap-2">
            <input
              id="custom-date-picker"
              type="date"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
              className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-[#0B4CA3] focus:ring-1 focus:ring-[#0B4CA3] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleSelect(inputDate)}
              className="flex items-center gap-1 rounded-xl bg-[#0B4CA3] px-4 py-2 text-xs font-bold text-white hover:bg-[#093F8E] cursor-pointer"
            >
              <Check className="h-4 w-4" /> Go
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
