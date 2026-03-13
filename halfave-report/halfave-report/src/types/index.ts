// ─── Shared Types ─────────────────────────────────────────────────────────────
// Single source of truth for all shared data shapes.
// Import from here in ReportPage, RiskIndexPage, and any future pages.

export interface Building {
  id: string;
  bin?: number | string | null;
  bbl?: string | null;
  address: string;
  borough?: number | string | null;
  stories?: number | null;
  unit_count?: number | null;
  year_built?: number | null;
  zipcode?: string | null;
  management_program?: string | null;
  slug?: string;
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

// Borough stat used in RiskIndexPage and ReportPage peer comparison
export interface BoroughStat {
  name: string;
  avg_score: number;
  count: number;
}

// Shape of window.__halfaveBldg set by MainSite after a BIN lookup
export interface HalfaveBldgWindow {
  bin: number | string;
  address: string;
  bbl: string;
  stories: string;
  units: string;
  yearBuilt: string;
  zipcode: string;
  borough: string;
  boroName: string;
  managementProgram: string;
  riskScore: number;
  percentile: number;
  riskBucket: string;
  openViolations: number;
  recent12m: number;
  balanceDue: number;
  elevatorCount: number;
  elevatorOverdue: number;
  boilerCount: number;
  expiredTco: boolean;
  hpdBuildingId: string;
  topDrivers: string[];
  violations: {
    hpd: { open: any[]; closed: any[] };
    dob: { open: any[]; closed: any[] };
    ecb: { open: any[]; closed: any[] };
    oath: any[];
    sanitation: any[];
    dohmh: any[];
    nypd: any[];
  };
  elevators: any[];
  boilers: any[];
  co: any | null;
}

// Extend Window so (window as HalfaveWindow).__halfaveBldg is typed
export interface HalfaveWindow extends Window {
  __halfaveBldg?: HalfaveBldgWindow;
}
