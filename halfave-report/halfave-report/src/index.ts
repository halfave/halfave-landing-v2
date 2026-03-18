// ─── Shared Types & Constants ─────────────────────────────────────────────────

export type RiskBucket = "Critical" | "High Risk" | "Elevated" | "Watch" | "Healthy";

export const RISK_ORDER: RiskBucket[] = ["Critical", "High Risk", "Elevated", "Watch", "Healthy"];

export const RISK_COLORS: Record<string, string> = {
  Critical:    "#c4533a",
  "High Risk": "#d97b3a",
  Elevated:    "#c9a227",
  Watch:       "#7a8fa6",
  Healthy:     "#3a7d5e",
};

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
  borough_name?: string;        // string (not nullable) — useRiskData sorts on this
  stories?: number | null;
  story_band?: string;          // string (not nullable) — useRiskData sorts on this
  unit_count?: number | null;
  year_built?: number | null;
  zipcode?: string | null;
  management_program?: string | null;
  slug?: string | null;
  risk_score?: number | null;
  health_score?: number | null;
  risk_bucket?: RiskBucket | string | null;
  percentile?: number | null;
  top_drivers?: string[] | null;
  // Full edge function payload, passed through from MainSitePage to ReportPage
  _payload?: {
    building: EdgeBuilding;
    score: EdgeScore;
    features: EdgeFeatures;
    violations: EdgeViolations;
  } | null;
}

export interface RiskScore {
  risk_score: number;
  risk_bucket: string;
  percentile: number;
  top_drivers?: { drivers: string[] };
}

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

export interface BoroughStat {
  name: string;
  avg_score: number;
  count: number;
}

// ─── useRiskData types ────────────────────────────────────────────────────────
// PivotRow: accumulator keyed by borough/story_band/mgmt label,
// with per-bucket counts, plus total and avg_score.
export interface PivotRow {
  label: string;
  Critical: number;
  "High Risk": number;
  Elevated: number;
  Watch: number;
  Healthy: number;
  avg_score: number;
  total: number;
}

export interface RiskSummary {
  total: number;
  by_bucket: Record<RiskBucket, number>;
  by_borough: PivotRow[];
  by_story_band: PivotRow[];
  by_mgmt: PivotRow[];
  top_buildings: Building[];
}

// ─── Edge function payload shapes ────────────────────────────────────────────
export interface EdgeBuilding {
  bin: string;
  address: string;
  borough: string;
  boroName: string;
  bbl: string;
  stories: string;
  units: string;
  yearBuilt: string;
  zipcode: string;
  managementProgram: string;
}

export interface EdgeScore {
  healthScore: number;
  riskBucket: string;
  percentile: number;
  formulaVersion: string;
}

export interface EdgeFeatures {
  open_violations: number;
  severity_points: number;
  violation_density: number;
  avg_resolution_days: number;
  expired_tco: boolean;
  boiler_count: number;
  boiler_avg_missed_years: number;
  elevator_count: number;
  elevator_avg_missed_years: number;
  recent_12m_violations?: number;
  avg_open_age_days?: number;
  resolution_rate?: number;
}

export interface EdgeViolationItem {
  id: string;
  desc: string;
  date: string;
  cls: string;
  isOpen: boolean;
  penalty: number | null;
  apt: string;
  link?: string;
}

export interface EdgeViolations {
  hpd:        { open: EdgeViolationItem[]; closed: EdgeViolationItem[] };
  dob:        { open: EdgeViolationItem[]; closed: EdgeViolationItem[] };
  ecb:        { open: EdgeViolationItem[]; closed: EdgeViolationItem[] };
  sanitation: { open: EdgeViolationItem[]; closed: EdgeViolationItem[] };
  dohmh:      { open: EdgeViolationItem[]; closed: EdgeViolationItem[] };
}

export interface EdgeBoiler {
  id:           string;
  status:       string;
  last_insp:    string | null;
  missed_years: number;
}

export interface EdgeElevator {
  id:           string;
  status:       string;
  cat1_date:    string | null;
  pvt_date:     string | null;
  missed_years: number;
}

export interface EdgeCo {
  type:         string;
  issued_date:  string | null;
  is_final:     boolean;
  expired:      boolean;
}

export interface EdgeDevices {
  boilers:   EdgeBoiler[];
  elevators: EdgeElevator[];
}

// ─── window.__halfaveBldg ────────────────────────────────────────────────────
export interface HalfaveBldgWindow {
  // Convenience fields used by MainSitePage
  bin: number | string;
  address: string;
  borough: string;
  riskScore: number;
  percentile: number;
  riskBucket: string;

  // Full edge function payload — passed through to ReportPage, no re-fetch needed
  building: EdgeBuilding;
  score: EdgeScore;
  features: EdgeFeatures;
  violations: EdgeViolations;
  devices: EdgeDevices;
  co: EdgeCo | null;
}

export type HalfaveWindow = Window & { __halfaveBldg?: HalfaveBldgWindow };
