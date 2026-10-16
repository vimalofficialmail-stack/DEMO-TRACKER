import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, RotateCcw, Check } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { METRIC_CONFIGS } from './MetricCard.tsx';

export const QuickEditModal: React.FC = () => {
  const { quickEditMetric, setQuickEditMetric, currentMetrics, setMetricValue } = useApp();
  const [val, setVal] = useState<number>(0);

  useEffect(() => {
    if (quickEditMetric) {
      setVal(currentMetrics[quickEditMetric] ?? 0);
    }
  }, [quickEditMetric, currentMetrics]);

  if (!quickEditMetric) return null;

  const config = METRIC_CONFIGS[quickEditMetric];

  const handleSave = () => {
    setMetricValue(quickEditMetric, val);
    setQuickEditMetric(null);
  };

  const adjust = (delta: number) => {
    setVal((prev) => Math.max(0, prev + delta));
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-edit-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="relative w-full max-w-xs rounded-2xl bg-white p-5 shadow-xl border border-slate-100">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div
              style={{ backgroundColor: config.badgeBg, color: config.badgeTextColor }}
              className="flex h-7 w-7 items-center justify-center rounded-lg"
            >
              {config.icon}
            </div>
            <h3 id="quick-edit-title" className="text-sm font-bold text-slate-900">
              {config.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setQuickEditMetric(null)}
            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close edit modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Counter Display & Direct Number Input */}
        <div className="my-5 flex flex-col items-center">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => adjust(-1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 active:scale-95 transition"
              aria-label="Decrease by 1"
            >
              <Minus className="h-5 w-5" />
            </button>

            <input
              type="number"
              min="0"
              value={val}
              onChange={(e) => setVal(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-24 text-center text-4xl font-extrabold text-slate-900 border-b-2 border-slate-300 focus:border-[#0B4CA3] focus:outline-none"
              aria-label="Current count"
            />

            <button
              type="button"
              onClick={() => adjust(1)}
              style={{ backgroundColor: config.accentColor }}
              className="flex h-11 w-11 items-center justify-center rounded-full text-white shadow-sm hover:brightness-110 active:scale-95 transition"
              aria-label="Increase by 1"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>

          {/* Quick preset increments */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => adjust(5)}
              className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              +5
            </button>
            <button
              type="button"
              onClick={() => adjust(10)}
              className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              +10
            </button>
            <button
              type="button"
              onClick={() => setVal(0)}
              className="flex items-center gap-1 rounded-lg bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setQuickEditMetric(null)}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#0B4CA3] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#093F8E] active:scale-95 transition"
          >
            <Check className="h-4 w-4" /> Save
          </button>
        </div>
      </div>
    </div>
  );
};
