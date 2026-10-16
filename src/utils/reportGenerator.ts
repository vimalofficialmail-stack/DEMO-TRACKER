import type { DailyMetrics, TraineeProfile } from '../types/index.ts';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format a date string (YYYY-MM-DD) into display formats like "Thu, 15 Oct 2026"
 */
export function formatPillDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]}, ${day} ${months[date.getMonth()]} ${year}`;
  } catch {
    return dateStr;
  }
}

export function formatDisplayDate(dateStr: string): string {
  return formatPillDate(dateStr);
}

export function formatFullReportDate(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${weekdays[date.getDay()]}, ${day} ${months[date.getMonth()]} ${year}`;
  } catch {
    return dateStr;
  }
}

/**
 * Calculate completion rate percentage based on completions / today D0 bookings.
 * Returns percentage (0-100) rounded to 1 decimal place.
 */
export function calculateCompletionRate(completions: number, todayD0: number): number {
  if (todayD0 <= 0) {
    return completions > 0 ? 100 : 0;
  }
  const rate = (completions / todayD0) * 100;
  return Math.min(Math.round(rate * 10) / 10, 100);
}

/**
 * Calculate cancellation rate percentage based on cancellations / (today D0 or total bookings).
 */
export function calculateCancellationRate(cancellations: number, todayD0: number): number {
  const base = todayD0 > 0 ? todayD0 : cancellations;
  if (base <= 0) return 0;
  const rate = (cancellations / base) * 100;
  return Math.min(Math.round(rate * 10) / 10, 100);
}

/**
 * Generates the clean formatted WhatsApp EOD Report string
 */
export function generateWhatsAppReportText(metrics: DailyMetrics, profile: TraineeProfile): string {
  const formattedDate = formatFullReportDate(metrics.date);
  const traineeName = profile.name ? profile.name.trim() : 'Vimal';
  const teamLead = profile.teamLead ? profile.teamLead.trim() : 'Ankit Sharma';

  return [
    ` Name - ${traineeName}`,
    ` Team Lead: ${teamLead}`,
    ` Date: ${formattedDate}`,
    `────────────────────────`,
    `📈 DAILY DEMO METRICS:`,
    `*  Total Demo Bookings: ${metrics.totalBookings}`,
    `*  Booking for Today (D0): ${metrics.todayD0}`,
    `*  Bookings for Tomorrow (D1): ${metrics.tomorrowD1}`,
    `*  Demo Completions: ${metrics.completions}`,
    `*  Demo Cancellations: ${metrics.cancellations}`,
  ].join('\n');
}

/**
 * Generates direct wa.me URL for one-tap WhatsApp sharing
 */
export function getWhatsAppShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Creates default metrics for a given date string (YYYY-MM-DD)
 */
export function createDefaultMetrics(dateStr: string): DailyMetrics {
  return {
    date: dateStr,
    totalBookings: 0,
    todayD0: 0,
    tomorrowD1: 0,
    completions: 0,
    cancellations: 0,
    remarks: '',
  };
}

/**
 * Creates default trainee profile
 */
export function createDefaultProfile(): TraineeProfile {
  return {
    name: 'Vimal',
    employeeId: 'EMP-88421',
    teamLead: 'Ankit Sharma',
    batch: 'Batch 2026-Q4 Pre-Sales',
    dailyTarget: 10,
    phone: '',
  };
}

/**
 * Creates fresh, clean profile for a new user
 */
export function createNewUserProfile(name?: string, email?: string): TraineeProfile {
  return {
    name: name || (email ? email.split('@')[0] : 'Trainee'),
    employeeId: '',
    teamLead: '',
    batch: '',
    dailyTarget: 10,
    phone: '',
  };
}
