import React from 'react';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatPillDate } from '../utils/reportGenerator.ts';

export const DatePill: React.FC = () => {
  const { selectedDate, setIsDatePickerOpen } = useApp();

  const formattedDate = formatPillDate(selectedDate);

  return (
    <div className="flex items-center justify-center pt-2.5 pb-1 px-4">
      {/* Centered Floating Rounded White Card: [ 📅 Date ▾ ] */}
      <button
        type="button"
        onClick={() => setIsDatePickerOpen(true)}
        className="group inline-flex items-center gap-2 rounded-full border border-slate-200/90 bg-white px-4 py-1.5 text-xs sm:text-sm font-semibold text-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.06)] hover:border-[#0B4CA3]/40 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer"
        aria-label={`Select date, currently ${formattedDate}`}
      >
        <CalendarIcon className="h-4 w-4 text-[#0B4CA3] group-hover:scale-105 transition-transform" />
        <span className="font-bold text-slate-800 tracking-normal">{formattedDate}</span>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#0B4CA3] transition-colors" />
      </button>
    </div>
  );
};
