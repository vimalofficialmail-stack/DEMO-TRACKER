import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';
import { useApp } from '../context/AppContext.tsx';
import {
  BarChart3,
  CheckCircle2,
  TrendingUp,
  Award,
  Calendar,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';

interface MonthlyCompletionsBarChartProps {
  className?: string;
}

export const MonthlyCompletionsBarChart: React.FC<MonthlyCompletionsBarChartProps> = ({
  className = '',
}) => {
  const { allMetrics, profile, setSelectedDate, setActiveTab } = useApp();

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIdx = now.getMonth(); // 0-indexed
  const todayDay = now.getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const currentMonthName = monthNames[currentMonthIdx];

  // Number of days in current month
  const totalDaysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();

  // Generate chart data for all days in the current month
  const monthlyData = useMemo(() => {
    const list = [];
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const monthStr = String(currentMonthIdx + 1).padStart(2, '0');
      const dayStr = String(day).padStart(2, '0');
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

      const d = new Date(currentYear, currentMonthIdx, day);
      const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const weekday = weekdays[d.getDay()];

      const metric = allMetrics[dateStr];
      const completions = Number(metric?.completions) || 0;
      const todayD0 = Number(metric?.todayD0) || 0;
      const totalBookings = Number(metric?.totalBookings) || 0;
      const isToday = day === todayDay;
      const isFuture = day > todayDay;

      list.push({
        day,
        dayLabel: String(day),
        fullDateStr: dateStr,
        weekday,
        completions,
        todayD0,
        totalBookings,
        isToday,
        isFuture,
        hasRecord: Boolean(metric),
      });
    }
    return list;
  }, [allMetrics, currentYear, currentMonthIdx, todayDay, totalDaysInMonth]);

  // Aggregate stats for current month
  const monthStats = useMemo(() => {
    let totalCompleted = 0;
    let daysWithCompletions = 0;
    let peakDayNum = 0;
    let peakCount = 0;

    monthlyData.forEach((item) => {
      totalCompleted += item.completions;
      if (item.completions > 0) {
        daysWithCompletions++;
      }
      if (item.completions > peakCount) {
        peakCount = item.completions;
        peakDayNum = item.day;
      }
    });

    const daysElapsed = Math.max(1, todayDay);
    const dailyAverage = (totalCompleted / daysElapsed).toFixed(1);

    return {
      totalCompleted,
      daysWithCompletions,
      peakDayNum,
      peakCount,
      dailyAverage,
    };
  }, [monthlyData, todayDay]);

  const handleBarClick = (entry: { fullDateStr?: string }) => {
    if (entry?.fullDateStr) {
      setSelectedDate(entry.fullDateStr);
      setActiveTab('home');
    }
  };

  return (
    <div
      className={`rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-sm ${className}`}
    >
      {/* Header with Title and Current Month Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0B4CA3]/10 text-[#0B4CA3]">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Monthly Completed Demos
              </h2>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-[#0B4CA3] border border-blue-200/60">
                {currentMonthName} {currentYear}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Daily completed demos breakdown across {totalDaysInMonth} days in {currentMonthName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 border border-slate-200/70">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>Today: {todayDay} {currentMonthName}</span>
          </span>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Total Completed this Month */}
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B4CA3]">
              Completed Demos
            </span>
            <CheckCircle2 className="h-4 w-4 text-[#0B4CA3]" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {monthStats.totalCompleted}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              total in {currentMonthName.slice(0, 3)}
            </span>
          </div>
        </div>

        {/* KPI 2: Daily Average */}
        <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/60 to-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              Daily Average
            </span>
            <TrendingUp className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {monthStats.dailyAverage}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              demos / day
            </span>
          </div>
        </div>

        {/* KPI 3: Peak Performance Day */}
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
              Best Day Peak
            </span>
            <Award className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {monthStats.peakCount}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {monthStats.peakDayNum > 0 ? `on Day ${monthStats.peakDayNum}` : 'No records'}
            </span>
          </div>
        </div>

        {/* KPI 4: Active Days */}
        <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/60 to-white p-3.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
              Active Days
            </span>
            <Sparkles className="h-4 w-4 text-purple-600" />
          </div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900">
              {monthStats.daysWithCompletions}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              / {todayDay} days elapsed
            </span>
          </div>
        </div>
      </div>

      {/* Bar Chart Section */}
      <div className="mt-5">
        <div className="h-64 sm:h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyData}
              margin={{ top: 12, right: 10, left: -22, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                tick={{ fontSize: 10.5, fill: '#64748B', fontWeight: 500 }}
                interval={window.innerWidth < 640 ? 2 : 0}
              />
              <YAxis
                allowDecimals={false}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10.5, fill: '#64748B' }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(11, 76, 163, 0.04)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg text-xs">
                        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-1.5">
                          <span className="font-bold text-slate-900">
                            {data.weekday}, {data.day} {currentMonthName}
                          </span>
                          {data.isToday && (
                            <span className="rounded-sm bg-orange-100 px-1.5 py-0.5 text-[9px] font-bold text-[#FF7A00]">
                              TODAY
                            </span>
                          )}
                        </div>
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-500">Completed Demos:</span>
                            <span className="font-extrabold text-[#0B4CA3] text-sm">
                              {data.completions}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-500">Today D0 Bookings:</span>
                            <span className="font-semibold text-slate-700">
                              {data.todayD0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-slate-500">Total Bookings:</span>
                            <span className="font-semibold text-slate-700">
                              {data.totalBookings}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2.5 pt-1.5 border-t border-slate-100 text-[10px] text-blue-600 font-semibold flex items-center gap-1">
                          <span>Click bar to view & edit day</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {profile.dailyTarget > 0 && (
                <ReferenceLine
                  y={profile.dailyTarget}
                  stroke="#FF7A00"
                  strokeDasharray="4 4"
                  strokeWidth={1.5}
                  label={{
                    value: `Target (${profile.dailyTarget})`,
                    position: 'top',
                    fill: '#FF7A00',
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
              )}

              <Bar
                dataKey="completions"
                radius={[5, 5, 0, 0]}
                maxBarSize={28}
                cursor="pointer"
              >
                {monthlyData.map((item) => {
                  let fillColor = '#0B4CA3'; // Royal Blue for standard days
                  if (item.isToday) {
                    fillColor = '#FF7A00'; // Brand Orange for Today
                  } else if (item.completions === 0) {
                    fillColor = item.isFuture ? '#F1F5F9' : '#E2E8F0'; // subtle grey for 0 or future
                  }
                  return (
                    <Cell
                      key={`bar-${item.day}`}
                      fill={fillColor}
                      opacity={item.isFuture ? 0.4 : 1}
                      onClick={() => handleBarClick(item)}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Legend & Help bar */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#0B4CA3]" />
              <span>Completed Demos</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#FF7A00]" />
              <span>Today ({todayDay} {currentMonthName.slice(0, 3)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-[#E2E8F0]" />
              <span>Zero / Future Day</span>
            </div>
            {profile.dailyTarget > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="h-0.5 w-3 bg-[#FF7A00] border-t border-dashed border-[#FF7A00]" />
                <span>Daily Target ({profile.dailyTarget})</span>
              </div>
            )}
          </div>

          <span className="text-[10px] text-slate-400 font-medium">
            💡 Tip: Click any bar to load that day's full report
          </span>
        </div>
      </div>
    </div>
  );
};
