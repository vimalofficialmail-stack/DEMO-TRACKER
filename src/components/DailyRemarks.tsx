import React from 'react';
import { Calendar as CalendarIcon, MessageSquare } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';

export const DailyRemarks: React.FC = () => {
  const { currentMetrics, updateRemarks } = useApp();

  const quickRemarks = [
    'Completed all D0 slots',
    'Follow-up set for tomorrow',
    'Parents attended actively',
    'Grade 5 math batch enrolled',
    'Rescheduled per parent request',
  ];

  const handleChipClick = (chip: string) => {
    if (!currentMetrics.remarks.trim()) {
      updateRemarks(chip);
    } else if (!currentMetrics.remarks.includes(chip)) {
      updateRemarks(`${currentMetrics.remarks.trim()} | ${chip}`);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="daily-remarks-input"
          className="flex items-center gap-1.5 text-sm font-bold text-slate-800"
        >
          <CalendarIcon className="h-4 w-4 text-[#0B4CA3]" />
          <span>Daily Remarks</span>
        </label>
        <span className="text-[11px] font-medium text-slate-400">
          Auto-saves
        </span>
      </div>

      {/* Outlined Rounded Textarea */}
      <div className="relative">
        <textarea
          id="daily-remarks-input"
          value={currentMetrics.remarks}
          onChange={(e) => updateRemarks(e.target.value)}
          placeholder="Add your remarks here..."
          rows={2}
          className="w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#0B4CA3] focus:ring-2 focus:ring-[#0B4CA3]/20 focus:outline-none transition-all shadow-xs"
        />
      </div>

      {/* Quick Suggestion Chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-nowrap">
        {quickRemarks.map((chip) => (
          <button
            key={chip}
            type="button"
            onClick={() => handleChipClick(chip)}
            className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-200 hover:text-slate-900 active:scale-95 transition-all cursor-pointer"
          >
            + {chip}
          </button>
        ))}
      </div>
    </div>
  );
};
