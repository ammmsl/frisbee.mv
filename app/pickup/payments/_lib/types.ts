export type RawRow = string[];

export interface AppData {
  summary: RawRow[];
  attendance: RawRow[];
  payments: RawRow[];
  sessionInput: RawRow[];
  users: string[];
  years: string[];
}

export type PaymentStatus = 'paid' | 'partial' | 'unpaid';

export type EventType = 'cost' | 'payment';

export interface TimelineEvent {
  date: Date;
  dateStr: string;
  type: EventType;
  amount: number;
  cumulativeCost: number;
  cumulativePaid: number;
  // cost events only
  location?: string;
  month?: string;
  // payment events only
  reference?: string;
}

export interface SessionEntry {
  date: Date;
  dateStr: string;
  location: string;
  month: string;
  amount: number;
  status: PaymentStatus;
  cumulativeCost: number;
}

export interface FinancialLedger {
  timeline: TimelineEvent[];
  sessions: SessionEntry[];
  totalPaid: number;
  cumulativeCost: number;
  cumulativePaid: number;
  unpaidCount: number;
  partialCount: number;
  pendingCount: number;
}

export type HealthStatus = 'caught-up' | 'prepaid' | 'pending';

export interface Debtor {
  name: string;
  pending: number;
}

export interface YearlyData {
  year: number;
  revenue: number;
  profit: number;
  fieldCosts: number;
}

export interface AdminMetrics {
  totalPending: number;
  totalPrepaid: number;
  operatingCash: number;
  netLiquidity: number;
  totalRevenue: number;
  fieldCostsPaid: number;
  collectedProfit: number;
  pendingProfit: number;
  potentialProfit: number;
  totalProfit: number;
  activePlayers: number;
  avgAttendance: number | string;
  retentionRate: number | string;
  paymentVelocity: number;
  topDebtors: Debtor[];
  yearlyData: YearlyData[];
  newPlayers: number;
  revenueTrend: string;
  chartLabels: string[];
  chartRevenue: number[];
  chartAttendance: number[];
  chartTimePeriod: string | number;
  chartBinning: string;
}

export interface RevenueChartData {
  labels: string[];
  revenue: number[];
  attendance: number[];
}

export interface VelocityChartData {
  labels: string[];
  velocities: (number | null)[];
}

export interface RetentionChartData {
  labels: string[];
  retentionRates: (number | null)[];
}

export type TimePeriod = '30' | '60' | '90' | '180' | 'all';
export type Binning = 'daily' | 'weekly' | 'monthly';

export type SortDirection = 'asc' | 'desc';

export interface SortState {
  col: string | null;
  asc: boolean;
}

export type MembershipStatus = 'Member' | 'Non-Member' | 'Pre-UFA';
