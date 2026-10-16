import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext.tsx';
import { TrendingUp, Award, Calendar, CheckCircle2, ChevronRight, BarChart2 } from 'lucide-react';

interface CompletionTrendsChartProps {
  className?: string;
}

export const CompletionTrendsChart: React.FC<CompletionTrendsChartProps> = ({ className = '' }) => {
  const { allMetrics, setSelectedDate, setActiveTab } = useApp();
  const [timeRange, setTimeRange] = useState<'7' | '30'>('7');
  const [activeMetricView, setActiveMetricView] = useState<'completions' | 'both'>('completions');

  // Generate date array for the last 7 or 30 days up to today
  const chartData = useMemo(() => {
    const daysCount = timeRange === '7' ? 7 : 30;
    const result = [];
    const today = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const shortDate = `${day} ${months[d.getMonth()]}`;
      const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];

      const metric = allMetrics[dateStr];
      const completions = metric?.completions ?? 0;
      const totalBookings = metric?.totalBookings ?? 0;
      const todayD0 = metric?.todayD0 ?? 0;
      const cancellations = metric?.cancellations ?? 0;

      const completionRate = todayD0 > 0
        ? Math.min(100, Math.round((completions / todayD0) * 100))
        : completions > 0
        ? 100
        : 0;

      result.push({
        dateStr,
        displayDate: shortDate,
        label: `${weekday}, ${shortDate}`,
        completions,
        totalBookings,
        todayD0,
        cancellations,
        completionRate,
      });
    }
    return result;
  }, [allMetrics, timeRange]);

  // Aggregate statistics
  const stats = useMemo(() => {
    let totalDone = 0;
    let totalBooked = 0;
    let maxCompletions = 0;
    let peakDay = '-';
    let daysWithDemos = 0;

    chartData.forEach((item) => {
      totalDone += item.completions;
      totalBooked += item.totalBookings;
      if (item.completions > maxCompletions) {
        maxCompletions = item.completions;
        peakDay = item.displayDate;
      }
      if (item.completions > 0 || item.totalBookings > 0) {
        daysWithDemos++;
      }
    });

    const avgDaily = chartData.length > 0 ? (totalDone / chartData.length).toFixed(1) : '0';
    const overallRate = totalBooked > 0 ? Math.round((totalDone / totalBooked) * 100) : 0;

    return {
      totalDone,
      totalBooked,
      maxCompletions,
      peakDay,
      avgDaily,
      overallRate,
      daysWithDemos,
    };
  }, [chartData]);

  const handleBarClick = (dateStr: string) => {
    setSelectedDate(dateStr);
    setActiveTab('home');
  };

  return (
    <div className={`rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xs ${className}`}>
      {/* Top Header Row with Time Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-[#EA580C]">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Demo Completion Trends</h2>
              <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-[#EA580C]">
                {timeRange} Days
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Visual analytics for pre-sales demo throughput
            </p>
          </div>
        </div>

        {/* Controls: 7D vs 30D Range & Metric View */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Metric Filter */}
          <div className="flex rounded-xl bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveMetricView('completions')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                activeMetricView === 'completions'
                  ? 'bg-white text-[#EA580C] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Completions
            </button>
            <button
              type="button"
              onClick={() => setActiveMetricView('both')}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                activeMetricView === 'both'
                  ? 'bg-white text-[#0B4CA3] shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              vs Bookings
            </button>
          </div>

          {/* 7D / 30D Range */}
          <div className="flex rounded-xl bg-slate-100 p-0.5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTimeRange('7')}
              className={`rounded-lg px-3 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                timeRange === '7'
                  ? 'bg-[#0B4CA3] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('30')}
              className={`rounded-lg px-3 py-1 text-[11px] font-bold transition-all cursor-pointer ${
                timeRange === '30'
                  ? 'bg-[#0B4CA3] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Strip */}
      <div className="my-3.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="rounded-xl border border-orange-100 bg-[#FEF3E7]/60 p-2.5 text-center">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-orange-700">
            Total Completions
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-[#EA580C] leading-tight">
            {stats.totalDone}
          </span>
          <span className="block text-[10px] text-slate-400 mt-0.5">
            in last {timeRange}d
          </span>
        </div>

        <div className="rounded-xl border border-blue-100 bg-[#EAF2FC]/60 p-2.5 text-center">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-700">
            Daily Average
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-[#0B4CA3] leading-tight">
            {stats.avgDaily}
          </span>
          <span className="block text-[10px] text-slate-400 mt-0.5">
            demos / day
          </span>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-[#E9F8F2]/60 p-2.5 text-center">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Peak Day
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-emerald-800 leading-tight">
            {stats.maxCompletions}
          </span>
          <span className="block text-[10px] text-slate-400 mt-0.5">
            {stats.maxCompletions > 0 ? `on ${stats.peakDay}` : 'no peak yet'}
          </span>
        </div>

        <div className="rounded-xl border border-purple-100 bg-[#F2EDFC]/60 p-2.5 text-center">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-purple-700">
            Active Days
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-purple-800 leading-tight">
            {stats.daysWithDemos}
          </span>
          <span className="block text-[10px] text-slate-400 mt-0.5">
            of {timeRange} tracked
          </span>
        </div>
      </div>

      {/* Main Area Chart Container */}
      <div className="mt-2 h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              {/* Vibrant Orange Gradient for Demo Completions */}
              <linearGradient id="completionGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EA580C" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#EA580C" stopOpacity={0.02} />
              </linearGradient>

              {/* Royal Blue Gradient for Total Bookings */}
              <linearGradient id="bookingGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0B4CA3" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0B4CA3" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />

            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={{ stroke: '#E2E8F0' }}
              tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }}
              interval={timeRange === '30' ? 4 : 0}
            />

            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#94A3B8' }}
              domain={[0, (dataMax: number) => Math.max(4, Math.ceil(dataMax * 1.2))]}
            />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-xs text-xs">
                      <p className="font-bold text-slate-900 border-b border-slate-100 pb-1.5 mb-1.5 flex items-center justify-between gap-4">
                        <span>{data.label}</span>
                        <span className="text-[10px] text-slate-400 font-normal">{data.dateStr}</span>
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-3 text-slate-700">
                          <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-[#EA580C]" />
                            <span className="font-medium">Completions:</span>
                          </span>
                          <span className="font-extrabold text-[#EA580C]">{data.completions}</span>
                        </div>

                        {activeMetricView === 'both' && (
                          <div className="flex items-center justify-between gap-3 text-slate-700">
                            <span className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-[#0B4CA3]" />
                              <span className="font-medium">Total Bookings:</span>
                            </span>
                            <span className="font-bold text-[#0B4CA3]">{data.totalBookings}</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between gap-3 text-slate-500 pt-1 border-t border-slate-50 text-[10px]">
                          <span>D0 Target Ratio:</span>
                          <span className="font-bold text-slate-700">{data.completionRate}%</span>
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            {activeMetricView === 'both' && (
              <Area
                type="monotone"
                dataKey="totalBookings"
                name="Total Bookings"
                stroke="#0B4CA3"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#bookingGrad)"
              />
            )}

            <Area
              type="monotone"
              dataKey="completions"
              name="Demo Completions"
              stroke="#EA580C"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#completionGrad)"
              dot={{ r: timeRange === '7' ? 4 : 2, fill: '#EA580C', strokeWidth: 1.5, stroke: '#FFFFFF' }}
              activeDot={{ r: 6, fill: '#EA580C', strokeWidth: 2, stroke: '#FFFFFF' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Quick Navigation Tip */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2.5 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-slate-600">
            <span className="h-2.5 w-2.5 rounded-full bg-[#EA580C]" />
            <span className="text-[11px] font-semibold">Demo Completions</span>
          </div>
          {activeMetricView === 'both' && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0B4CA3]" />
              <span className="text-[11px] font-semibold">Total Bookings</span>
            </div>
          )}
        </div>

        <span className="text-[10px] text-slate-400">
          Showing last {timeRange} days continuous trajectory
        </span>
      </div>
    </div>
  );
};
