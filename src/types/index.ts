export interface DailyMetrics {
  date: string; // YYYY-MM-DD format
  totalBookings: number;
  todayD0: number;
  tomorrowD1: number;
  completions: number;
  cancellations: number;
  remarks: string;
  lastUpdated?: string;
}

export interface TraineeProfile {
  name: string;
  employeeId: string;
  teamLead: string;
  batch: string;
  dailyTarget: number;
  phone?: string;
}

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface EODReportData {
  metrics: DailyMetrics;
  profile: TraineeProfile;
  generatedAt: string;
}

export type MetricKey = 'totalBookings' | 'todayD0' | 'tomorrowD1' | 'completions' | 'cancellations';

export type NavTab = 'home' | 'history' | 'calendar' | 'settings';
