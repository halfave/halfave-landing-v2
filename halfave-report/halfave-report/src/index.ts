// ─── Shared Types & Constants ─────────────────────────────────────────────────

// ─── Risk bucket ─────────────────────────────────────────────────────────────
export type RiskBucket = "Critical" | "High Risk" | "Elevated" | "Watch" | "Healthy";

export const RISK_ORDER: RiskBucket[] = ["Critical", "High Risk", "Elevated", "Watch", "Healthy"];

export const RISK_COLORS: Record<string, string> = {
  Critical:    "#c4533a",
  "High Risk": "#d97b3a",
  Elevated:    "#c9a227",
  Watch:       "#7a8fa6",
  Healthy:     "#3a7d5e",
};

// ─── Borough helpers ─────────────────────────────────────────────────────────
export const BOROUGH_NAMES: Record<string | number, string> = {
  1: "Manhattan", 2: "Bronx", 3: "Brooklyn", 4: "Queens", 5: "Staten Island",
  MN: "Manhattan", BX: "Bronx", BK: "Brooklyn", QN: "Queens", SI: "Staten Island",
};

// ─── Building ─────────────────────────────────────────────────────────────────
export interface Building {
  id: string;
  bin?: number | string | null;
  bbl?: string | null;
  address: string;
  borough?: number | string | null;
  borough_name?: string | null;
  stories?: number | null;
  story_band?: string | null;
  unit_count?: number | null;
  year_built?: number | null;
  zipcode?: string | null;
  management_program?: string | null;
  slug?: string | null;
  // Denormalised risk fields (set from window or Supabase join)
  risk_score?: number | null;
  risk_bucket?: RiskBucket | string | null;
  percentile?: number | null;
  top_drivers?: string[] | null;
}

// ─── Risk Score ──────────────────────────────────────────────────────────────
export interface RiskScore {
  risk_score: number;
  risk_bucket: string;
  percentile: number;
  top_drivers?: { drivers: string[] };
}

// ─── Building Features ───────────────────────────────────────────────────────
export interface BuildingFeatures {
  open_violations: number;
  recent_12m_violations: number;
  severity_points: number;
  avg_open_age_days: number;
  violation_density: number;
  avg_resolution_days: number;
  resolution_rate: number;
  expired_tco: boolean;
  boiler_count: number;
  boiler_avg_missed_years: number;
  elevator_count: number;
  elevator_avg_missed_years: number;
}

// ─── Violation ───────────────────────────────────────────────────────────────
export interface Violation {
  id: string;
  agency: "HPD" | "DOB" | "ECB";
  source: string;
  severity?: string;
  violation_type?: string;
  description?: string;
  is_open: boolean;
  issue_date?: string;
  close_date?: string;
  violation_code?: string;
  order_number?: string;
  balance_due?: number;
  penalty_amount?: number;
  disposition?: string;
}

// ─── Borough stat (peer comparison in ReportPage) ────────────────────────────
export interface BoroughStat {
  name: string;
  avg_score: number;
  count: number;
}

// ─── useRiskData hook types ───────────────────────────────────────────────────
// PivotRow is a bucket-keyed accumulator used inside the hook
export interface PivotRow {
  [bucket: string]: number;   // bucket keys: Critical, "High Risk", etc.
  total: number;
  avg_score: number;
}

export interface RiskSummary {
  total: number;
  by_bucket: Record<string, number>;
  avg_score: number;
  p75_score: number;
  p90_score: number;
}

// ─── window.__halfaveBldg ────────────────────────────────────────────────────
export interface HalfaveBldgWindow {
  bin: number | string;
  address: string;
  bbl: string;
  stories: string | number;
  units: string | number;
  yearBuilt?: string;
  zipcode?: string;
  borough: string;
  boroName?: string;
  managementProgram?: string;
  riskScore: number;
  percentile: number;
  riskBucket: string;
  openViolations?: number;
  recent12m?: number;
  balanceDue?: number;
  elevatorCount?: number;
  elevatorOverdue?: number;
  boilerCount?: number;
  expiredTco?: boolean;
  hpdBuildingId?: string;
  topDrivers?: string[];
  violations?: {
    hpd: { open: any[]; closed: any[] };
    dob: { open: any[]; closed: any[] };
    ecb: { open: any[]; closed: any[] };
    oath: any[];
    sanitation: any[];
    dohmh: any[];
    nypd: any[];
  };
  elevators?: any[];
  boilers?: any[];
  co?: any | null;
}

// Use as: (window as HalfaveWindow).__halfaveBldg
export type HalfaveWindow = Window & { __halfaveBldg?: HalfaveBldgWindow };
