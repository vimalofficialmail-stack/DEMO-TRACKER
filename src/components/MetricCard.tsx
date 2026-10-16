import React, { useState } from 'react';
import { Calendar, Check, X, Plus } from 'lucide-react';
import type { MetricKey } from '../types/index.ts';
import { useApp } from '../context/AppContext.tsx';

interface MetricConfig {
  key: MetricKey;
  title: string;
  bgColor: string; // Pastel background hex
  borderColor: string;
  accentColor: string; // Vibrant accent color for button/badge
  badgeBg: string;
  badgeTextColor: string;
  icon: React.ReactNode;
  subtitle?: string;
}

export const METRIC_CONFIGS: Record<MetricKey, MetricConfig> = {
  totalBookings: {
    key: 'totalBookings',
    title: 'Total Demo Booking',
    bgColor: '#E9F8F2',
    borderColor: '#D0F0E2',
    accentColor: '#16A34A',
    badgeBg: '#DCFCE7',
    badgeTextColor: '#15803D',
    icon: <Calendar className="h-4 w-4" strokeWidth={2.4} />,
    subtitle: 'All active bookings',
  },
  todayD0: {
    key: 'todayD0',
    title: 'Booking for Today (D0)',
    bgColor: '#EAF2FC',
    borderColor: '#D4E4FA',
    accentColor: '#2563EB',
    badgeBg: '#DBEAFE',
    badgeTextColor: '#1D4ED8',
    icon: <Calendar className="h-4 w-4" strokeWidth={2.4} />,
    subtitle: 'Immediate D0 demos',
  },
  tomorrowD1: {
    key: 'tomorrowD1',
    title: 'Bookings for Tomorrow (D1)',
    bgColor: '#F2EDFC',
    borderColor: '#E5DCFB',
    accentColor: '#7C3AED',
    badgeBg: '#EDE9FE',
    badgeTextColor: '#6D28D9',
    icon: <Calendar className="h-4 w-4" strokeWidth={2.4} />,
    subtitle: 'Upcoming D1 queue',
  },
  completions: {
    key: 'completions',
    title: 'Demo Completions',
    bgColor: '#FEF3E7',
    borderColor: '#FEE5CA',
    accentColor: '#EA580C',
    badgeBg: '#FFEDD5',
    badgeTextColor: '#C2410C',
    icon: <Check className="h-4 w-4" strokeWidth={3} />,
    subtitle: 'Successful sessions',
  },
  cancellations: {
    key: 'cancellations',
    title: 'Demo Cancellations',
    bgColor: '#FDECEE',
    borderColor: '#FBD7DC',
    accentColor: '#DC2626',
    badgeBg: '#FEE2E2',
    badgeTextColor: '#B91C1C',
    icon: <X className="h-4 w-4" strokeWidth={3} />,
    subtitle: 'No-show or dropped',
  },
};

interface MetricCardProps {
  metricKey: MetricKey;
  isFullWidth?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ metricKey, isFullWidth = false }) => {
  const { currentMetrics, incrementMetric, setQuickEditMetric } = useApp();
  const config = METRIC_CONFIGS[metricKey];
  const count = currentMetrics[metricKey] ?? 0;
  const [isBouncing, setIsBouncing] = useState(false);

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBouncing(true);
    incrementMetric(metricKey);
    setTimeout(() => setIsBouncing(false), 220);
  };

  return (
    <div
      style={{
        backgroundColor: config.bgColor,
        borderColor: config.borderColor,
      }}
      className={`relative flex flex-col justify-between rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md ${
        isFullWidth ? 'col-span-2' : ''
      }`}
    >
      {/* Top Row: Icon Badge & Title */}
      <div className="flex items-start gap-2.5">
        <div
          style={{
            backgroundColor: config.badgeBg,
            color: config.badgeTextColor,
          }}
          className={`flex h-7 w-7 shrink-0 items-center justify-center shadow-2xs ${
            metricKey === 'cancellations' ? 'rounded-full' : 'rounded-lg'
          }`}
        >
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold leading-tight text-slate-800 line-clamp-2">
            {config.title}
          </h3>
        </div>
      </div>

      {/* Bottom Row: Large Bold Count & Circular + Button */}
      <div className="mt-3 flex items-end justify-between">
        {/* Count display: Tapping opens quick edit */}
        <button
          type="button"
          onClick={() => setQuickEditMetric(metricKey)}
          className="group text-left focus:outline-none cursor-pointer"
          title={`Click to adjust ${config.title}`}
          aria-label={`${config.title} count: ${count}. Click to adjust.`}
        >
          <span className="text-3xl font-extrabold tracking-tight text-slate-900 group-hover:text-[#0B4CA3] transition-colors leading-none block">
            {count}
          </span>
          <span className="block text-[10px] font-medium text-slate-400 group-hover:text-slate-600 transition-colors mt-0.5">
            tap to edit
          </span>
        </button>

        {/* Circular + Action Button */}
        <button
          type="button"
          onClick={handleIncrement}
          style={{
            backgroundColor: config.accentColor,
          }}
          className={`flex h-9 w-9 items-center justify-center rounded-full text-white shadow-sm hover:brightness-110 active:brightness-90 transition-transform cursor-pointer ${
            isBouncing ? 'scale-125 rotate-45' : 'scale-100 hover:scale-105 active:scale-95'
          }`}
          aria-label={`Increment ${config.title}`}
          title={`Add 1 to ${config.title}`}
        >
          <Plus className="h-5 w-5" strokeWidth={2.8} />
        </button>
      </div>
    </div>
  );
};
