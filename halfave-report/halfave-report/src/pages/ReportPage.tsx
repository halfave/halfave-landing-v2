import { useEffect, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Building {
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
  slug?: string | null;
}

interface RiskScore {
  health_score?: number;
  risk_score: number;
  risk_bucket: string;
  percentile: number;
  top_drivers?: { drivers: string[] };
}

interface BuildingFeatures {
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

interface Violation {
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

// ─── Helpers ─────────────────────────────────────────────────────────────────
const BOROUGH_NAMES: Record<string, string> = {
  "1": "Manhattan",
  "2": "Bronx",
  "3": "Brooklyn",
  "4": "Queens",
  "5": "Staten Island",
  MN: "Manhattan",
  BX: "Bronx",
  BK: "Brooklyn",
  QN: "Queens",
  SI: "Staten Island",
};



function riskColor(score: number) {
  if (score >= 80) return "var(--risk-green)";
  if (score >= 60) return "var(--risk-amber)";
  return "var(--risk-red)";
}

function severityWeight(s?: string) {
  if (!s) return 0;
  const u = s.toUpperCase();
  if (u === "C" || u === "CLASS - 1") return 3;
  if (u === "B" || u === "CLASS - 2") return 2;
  return 1;
}

function severityLabel(s?: string, agency?: string) {
  if (!s) return "–";
  if (agency === "HPD") return `Class ${s}`;
  if (s.startsWith("CLASS")) return s.replace("CLASS - ", "ECB Class ");
  return s;
}

function severityColor(s?: string) {
  const u = (s ?? "").toUpperCase();
  if (u === "C" || u === "CLASS - 1") return "#c4533a";
  if (u === "B" || u === "CLASS - 2") return "#d97b3a";
  return "#c9a227";
}

function fmtDate(d?: string | null) {
  if (!d) return "–";
  return new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function fmtCurrency(n?: number | null) {
  if (!n) return "–";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
  :root {
    --navy: #111e30;
    --cream: #f7f4ef;
    --bg: #f0ede8;
    --risk-red: #c4533a;
    --risk-red-bg: #fdf0ed;
    --risk-amber: #c9a227;
    --risk-amber-bg: #fdf8ec;
    --risk-green: #3a7d5e;
    --risk-green-bg: #edf5f0;
    --slate: #7a8fa6;
    --navy-10: rgba(17,30,48,0.08);
    --navy-20: rgba(17,30,48,0.15);
    --font-serif: 'Lora', Georgia, serif;
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'DM Mono', 'Courier New', monospace;
    --radius: 12px;
    --radius-lg: 16px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--navy); font-family: 'Inter', -apple-system, sans-serif; }

  .rp-root { min-height: 100vh; background: var(--bg); }

  /* ── HERO ── */
  .rp-hero {
    background: var(--bg);
    padding: 48px 24px 32px;
    border-bottom: 1px solid var(--navy-10);
  }
  .rp-hero-inner { max-width: 860px; margin: 0 auto; }
  .rp-hero-eyebrow {
    font-family: var(--font-mono);
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--slate);
    margin-bottom: 12px;
  }
  .rp-hero-address {
    font-family: var(--font-serif);
    font-size: clamp(22px, 4vw, 40px);
    font-weight: 500;
    color: var(--navy);
    line-height: 1.15;
    margin-bottom: 8px;
    letter-spacing: -0.02em;
  }
  .rp-hero-meta {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--slate);
    margin-bottom: 28px;
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .rp-hero-meta span::before { content: '· '; }
  .rp-hero-meta span:first-child::before { content: ''; }
  .rp-hero-summary {
    font-size: 1rem;
    color: #6b7280;
    max-width: 620px;
    line-height: 1.6;
    margin-bottom: 0;
  }
  .rp-hero-summary strong { color: var(--navy); font-weight: 600; }

  /* ── BODY ── */
  .rp-body { max-width: 860px; margin: 0 auto; padding: 36px 24px 80px; font-family: 'Inter', -apple-system, sans-serif; }

  /* ── SECTION ── */
  .rp-section { margin-bottom: 40px; }
  .rp-section-title {
    font-family: 'Lora', Georgia, serif;
    font-weight: 600;
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--slate);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .rp-section-title::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--navy-10);
  }

  /* ── CARD ── */
  .rp-card {
    background: var(--cream);
    border-radius: var(--radius-lg);
    border: 1px solid var(--navy-10);
    overflow: hidden;
  }

  /* ── DRIVERS ── */
  .rp-drivers { display: flex; flex-direction: column; gap: 0; }
  .rp-driver {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 20px;
    border-bottom: 1px solid var(--navy-10);
    transition: background 0.15s;
  }
  .rp-driver:last-child { border-bottom: none; }
  .rp-driver:hover { background: rgba(17,30,48,0.03); }
  .rp-driver-idx {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--slate);
    width: 20px;
    flex-shrink: 0;
    text-align: right;
  }
  .rp-driver-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
  }
  .rp-driver-text {
    font-family: var(--font-serif);
    font-size: 14px;
    color: var(--navy);
    line-height: 1.4;
  }

  /* ── STATS GRID ── */
  .rp-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1px;
    background: var(--navy-10);
    border-radius: var(--radius-lg);
    overflow: hidden;
    border: 1px solid var(--navy-10);
  }
  .rp-stat {
    background: var(--cream);
    padding: 18px 20px;
  }
  .rp-stat-val {
    font-family: var(--font-mono);
    font-size: 22px;
    font-weight: 700;
    color: var(--navy);
    line-height: 1;
  }
  .rp-stat-lbl {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--slate);
    margin-top: 5px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    line-height: 1.3;
  }
  .rp-stat-warn { color: var(--risk-red); }
  .rp-stat-caution { color: var(--risk-amber); }
  .rp-stat-ok { color: var(--risk-green); }

  /* ── TABS ── */
  .rp-tabs-nav {
    display: flex;
    gap: 0;
    background: var(--navy-10);
    border-radius: 10px;
    padding: 3px;
    margin-bottom: 16px;
    width: fit-content;
  }
  .rp-tab-btn {
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 0.06em;
    padding: 7px 18px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    background: transparent;
    color: var(--slate);
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .rp-tab-btn.active {
    background: var(--cream);
    color: var(--navy);
    box-shadow: 0 1px 4px var(--navy-20);
  }
  .rp-tab-count {
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 10px;
    background: var(--navy-10);
    color: var(--slate);
  }
  .rp-tab-btn.active .rp-tab-count {
    background: var(--navy);
    color: var(--cream);
  }

  /* ── VIOLATION SUMMARY ── */
  .rp-vsummary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1px;
    background: var(--navy-10);
    border-radius: var(--radius) var(--radius) 0 0;
    overflow: hidden;
    border: 1px solid var(--navy-10);
    border-bottom: none;
  }
  .rp-vsum-cell {
    background: var(--cream);
    padding: 14px 16px;
    text-align: center;
  }
  .rp-vsum-num {
    font-family: var(--font-mono);
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
  }
  .rp-vsum-lbl {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--slate);
    margin-top: 3px;
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }

  /* ── VIOLATION TABLE ── */
  .rp-vtable-wrap {
    border: 1px solid var(--navy-10);
    border-radius: 0 0 var(--radius) var(--radius);
    overflow: hidden;
    background: var(--cream);
  }
  .rp-vtable { width: 100%; border-collapse: collapse; }
  .rp-vtable thead th {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--slate);
    padding: 10px 14px;
    text-align: left;
    background: var(--bg);
    border-bottom: 1px solid var(--navy-10);
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
  }
  .rp-vtable thead th:hover { color: var(--navy); }
  .rp-vtable thead th .sort-arrow { margin-left: 4px; opacity: 0.4; }
  .rp-vtable thead th.sorted .sort-arrow { opacity: 1; }
  .rp-vtable tbody tr {
    border-bottom: 1px solid var(--navy-10);
    transition: background 0.1s;
  }
  .rp-vtable tbody tr:last-child { border-bottom: none; }
  .rp-vtable tbody tr:hover { background: rgba(17,30,48,0.03); }
  .rp-vtable tbody tr.expandable { cursor: pointer; }
  .rp-vtable td {
    padding: 10px 14px;
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 13px;
    color: var(--navy);
    vertical-align: top;
  }
  .rp-sev-badge {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .rp-status-dot {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
  }
  .rp-status-dot::before {
    content: '';
    display: inline-block;
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }
  .rp-status-dot.open::before { background: var(--risk-red); }
  .rp-status-dot.closed::before { background: var(--risk-green); }
  .rp-expand-row td {
    background: rgba(17,30,48,0.03);
    padding: 0;
  }
  .rp-expand-inner {
    padding: 14px 20px;
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 13px;
    line-height: 1.6;
    color: var(--navy);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 24px;
  }
  .rp-expand-field { display: flex; flex-direction: column; gap: 2px; }
  .rp-expand-key {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--slate);
    text-transform: uppercase;
    letter-spacing: 0.07em;
  }
  .rp-expand-desc {
    grid-column: 1 / -1;
    font-size: 13px;
    line-height: 1.6;
    padding-top: 4px;
  }

  /* ── LOAD MORE ── */
  .rp-load-more {
    display: block;
    width: 100%;
    padding: 12px;
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.06em;
    background: var(--bg);
    border: none;
    border-top: 1px solid var(--navy-10);
    color: var(--slate);
    cursor: pointer;
    text-align: center;
    transition: color 0.15s;
  }
  .rp-load-more:hover { color: var(--navy); }

  /* ── ALERT CARD ── */
  .rp-alert {
    border-radius: var(--radius);
    border: 1px solid;
    padding: 14px 18px;
    display: flex;
    gap: 12px;
    align-items: flex-start;
    margin-bottom: 12px;
  }
  .rp-alert-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
  .rp-alert-body {}
  .rp-alert-title {
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 3px;
  }
  .rp-alert-body p {
    font-family: var(--font-serif);
    font-size: 13px;
    line-height: 1.5;
  }
  .rp-alert.red { background: var(--risk-red-bg); border-color: rgba(196,83,58,0.25); color: #1a1a1a; }
  .rp-alert.amber { background: var(--risk-amber-bg); border-color: rgba(201,162,39,0.25); color: #1a1a1a; }

  /* ── PEER BARS ── */
  .rp-peer-row {
    padding: 14px 20px;
    border-bottom: 1px solid var(--navy-10);
  }
  .rp-peer-row:last-child { border-bottom: none; }
  .rp-peer-label {
    display: flex;
    justify-content: space-between;
    margin-bottom: 6px;
  }
  .rp-peer-name {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--navy);
  }
  .rp-peer-val {
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 700;
    color: var(--navy);
  }
  .rp-peer-track {
    height: 6px;
    background: var(--navy-10);
    border-radius: 3px;
    position: relative;
    overflow: visible;
  }
  .rp-peer-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 1s cubic-bezier(0.4,0,0.2,1);
  }
  .rp-peer-avg {
    position: absolute;
    top: -3px;
    height: 12px;
    width: 2px;
    background: var(--slate);
    border-radius: 1px;
    opacity: 0.5;
  }

  /* ── LOADING / ERROR ── */
  .rp-loading {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    gap: 16px;
    color: var(--slate);
    font-family: var(--font-mono);
    font-size: 13px;
    letter-spacing: 0.08em;
  }
  .rp-spinner {
    width: 36px;
    height: 36px;
    border: 3px solid var(--navy-10);
    border-top-color: var(--navy);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── DEVICE CARDS ── */
  .rp-device-grid {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .rp-device-row {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 12px 20px;
    border-bottom: 1px solid var(--navy-10);
    font-family: var(--font-mono);
    font-size: 12px;
  }
  .rp-device-row:last-child { border-bottom: none; }
  .rp-device-id {
    font-weight: 700;
    color: var(--navy);
    min-width: 80px;
  }
  .rp-device-status {
    font-size: 10px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .rp-device-status.ok   { background: var(--risk-green-bg); color: var(--risk-green); }
  .rp-device-status.warn { background: var(--risk-red-bg);   color: var(--risk-red);   }
  .rp-device-date {
    margin-left: auto;
    color: var(--slate);
    font-size: 11px;
    text-align: right;
  }
  .rp-device-date.overdue { color: var(--risk-red); font-weight: 700; }
  .rp-tco-card {
    display: flex;
    align-items: flex-start;
    gap: 14px;
    padding: 16px 20px;
    font-family: var(--font-mono);
    font-size: 12px;
  }
  .rp-tco-badge {
    font-size: 10px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    flex-shrink: 0;
  }
  .rp-tco-badge.expired { background: var(--risk-red-bg);   color: var(--risk-red);   }
  .rp-tco-badge.expiring{ background: var(--risk-amber-bg); color: var(--risk-amber); }
  .rp-tco-badge.final   { background: var(--risk-green-bg); color: var(--risk-green); }

  @media (max-width: 600px) {
    .rp-kpi-row { flex-wrap: wrap; }
    .rp-kpi { padding: 0 16px; margin-bottom: 16px; }
    .rp-vsummary { grid-template-columns: repeat(2, 1fr); }
    .rp-expand-inner { grid-template-columns: 1fr; }
    .rp-stats-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;


// ─── Violation Row ─────────────────────────────────────────────────────────────
function ViolationRow({ v, expanded, onToggle }: {
  v: Violation;
  expanded: boolean;
  onToggle: () => void;
}) {
  const sc = severityColor(v.severity);
  const hasDetail = !!(v.description || v.order_number || v.penalty_amount || v.balance_due || v.disposition);

  return (
    <>
      <tr className={hasDetail ? "expandable" : ""} onClick={hasDetail ? onToggle : undefined}>
        <td>
          <span
            className="rp-sev-badge"
            style={{ background: sc + "22", color: sc }}
          >
            {severityLabel(v.severity, v.agency)}
          </span>
        </td>
        <td style={{ maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {v.violation_type || v.description?.slice(0, 60) || "–"}
        </td>
        <td style={{ color: "var(--slate)" }}>{fmtDate(v.issue_date)}</td>
        <td style={{ textAlign: "right" }}>
          {hasDetail && (
            <span style={{ color: "var(--slate)", fontSize: 10 }}>
              {expanded ? "▲" : "▼"}
            </span>
          )}
        </td>
      </tr>
      {expanded && hasDetail && (
        <tr className="rp-expand-row">
          <td colSpan={4}>
            <div className="rp-expand-inner">
              {v.description && (
                <div className="rp-expand-field rp-expand-desc">
                  <span className="rp-expand-key">Description</span>
                  <span>{v.description}</span>
                </div>
              )}
              {v.order_number && (
                <div className="rp-expand-field">
                  <span className="rp-expand-key">Order #</span>
                  <span>{v.order_number}</span>
                </div>
              )}
              {v.violation_code && (
                <div className="rp-expand-field">
                  <span className="rp-expand-key">Code</span>
                  <span>{v.violation_code}</span>
                </div>
              )}
              {v.penalty_amount != null && (
                <div className="rp-expand-field">
                  <span className="rp-expand-key">Penalty</span>
                  <span>{fmtCurrency(v.penalty_amount)}</span>
                </div>
              )}
              {v.balance_due != null && (
                <div className="rp-expand-field">
                  <span className="rp-expand-key">Balance Due</span>
                  <span style={{ color: v.balance_due > 0 ? "var(--risk-red)" : undefined }}>
                    {fmtCurrency(v.balance_due)}
                  </span>
                </div>
              )}
              {v.disposition && (
                <div className="rp-expand-field">
                  <span className="rp-expand-key">Disposition</span>
                  <span>{v.disposition}</span>
                </div>
              )}
              {v.close_date && (
                <div className="rp-expand-field">
                  <span className="rp-expand-key">Closed</span>
                  <span>{fmtDate(v.close_date)}</span>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}


// ─── ViolationTabContent ─────────────────────────────────────────────────────
function ViolationTabContent({ violations, agency }: { violations: Violation[]; agency: "HPD" | "DOB" | "ECB" }) {
  const [sortKey, setSortKey] = useState<"severity" | "issue_date" | "violation_type">("severity");
  const [sortAsc, setSortAsc] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(20);

  const open = violations.filter(v => v.is_open && v.agency === agency);
  const sorted = [...open].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "severity") cmp = severityWeight(b.severity) - severityWeight(a.severity);
    else if (sortKey === "issue_date") cmp = (b.issue_date ?? "").localeCompare(a.issue_date ?? "");
    else if (sortKey === "violation_type") cmp = (a.violation_type ?? "").localeCompare(b.violation_type ?? "");
    return sortAsc ? -cmp : cmp;
  });

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) setSortAsc(!sortAsc); else { setSortKey(key); setSortAsc(false); }
    setPage(20);
  }
  function toggleExpand(id: string) {
    setExpanded(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }
  const th = (label: string, key: typeof sortKey) => (
    <th className={sortKey === key ? "sorted" : ""} onClick={() => toggleSort(key)}>
      {label}<span className="sort-arrow">{sortKey === key ? (sortAsc ? "↑" : "↓") : "↕"}</span>
    </th>
  );

  if (open.length === 0) return (
    <div style={{ padding: "32px 20px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--slate)" }}>
      No open {agency} violations
    </div>
  );

  return (
    <div className="rp-vtable-wrap">
      <table className="rp-vtable">
        <thead><tr>{th("Severity", "severity")}{th("Type / Description", "violation_type")}{th("Issued", "issue_date")}<th></th></tr></thead>
        <tbody>
          {sorted.slice(0, page).map(v => (
            <ViolationRow key={v.id} v={v} expanded={expanded.has(v.id)} onToggle={() => toggleExpand(v.id)} />
          ))}
        </tbody>
      </table>
      {sorted.length > page && (
        <button className="rp-load-more" onClick={() => setPage(p => p + 20)}>
          Show more ({sorted.length - page} remaining)
        </button>
      )}
    </div>
  );
}

// ─── ComplianceSection ────────────────────────────────────────────────────────
function ComplianceSection({ violations, devices, co }: {
  violations: Violation[];
  devices: { boilers: any[]; elevators: any[] };
  co: any;
}) {
  const openByAgency = (t: string) => violations.filter(v => v.is_open && v.agency === t);
  const violTabs: ("HPD"|"DOB"|"ECB")[] = ["HPD","DOB","ECB"];
  const overdueBoilers   = devices.boilers.filter((b: any) => b.missed_years > 1 && (b.status||'').toLowerCase().includes('accept'));
  const hasBoilers   = overdueBoilers.length > 0;
  const overdueElevators = devices.elevators.filter((e: any) => e.missed_years > 1 && (e.status||'').toUpperCase().includes('ACTIVE'));
  const hasElevators = overdueElevators.length > 0;
  const hasCo        = co && !co.is_final;
  const hasInspections = hasBoilers || hasElevators || hasCo;

  const firstViolTab = violTabs.find(t => openByAgency(t).length > 0);
  const [activeTab, setActiveTab] = useState<"HPD"|"DOB"|"ECB"|"Inspections">(
    firstViolTab ?? "Inspections"
  );

  if (!violations.some(v => v.is_open) && !hasInspections) return null;

  return (
    <div className="rp-section">
      <div className="rp-section-title">Compliance Issues</div>
      <div className="rp-tabs-nav" style={{ marginBottom: 16 }}>
        {violTabs.filter(t => openByAgency(t).length > 0).map(t => (
          <button key={t} className={`rp-tab-btn ${activeTab === t ? "active" : ""}`} onClick={() => setActiveTab(t)}>
            {t} <span className="rp-tab-count">{openByAgency(t).length}</span>
          </button>
        ))}
        {hasInspections && (
          <button className={`rp-tab-btn ${activeTab === "Inspections" ? "active" : ""}`} onClick={() => setActiveTab("Inspections")}>
            Inspections
            <span className="rp-tab-count" style={{ background: "var(--risk-amber)", color: "#fff" }}>
              {(hasCo ? 1 : 0) + overdueBoilers.length + overdueElevators.length}
            </span>
          </button>
        )}
      </div>

      {(activeTab === "HPD" || activeTab === "DOB" || activeTab === "ECB") && (
        <ViolationTabContent violations={violations} agency={activeTab} />
      )}

      {activeTab === "Inspections" && (
        <div>
          {hasCo && (
            <div className="rp-card" style={{ marginBottom: 16 }}>
              <div className="rp-tco-card">
                <span className={`rp-tco-badge ${co.expired ? "expired" : "expiring"}`}>
                  {co.expired ? "TCO Expired" : "Temp CO"}
                </span>
                <div>
                  <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: 3, fontFamily: "var(--font-mono)", fontSize: 12 }}>Certificate of Occupancy</div>
                                      <div style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--slate)" }}>
                      {co.issued_date && <>Issued {fmtDate(co.issued_date)} · </>}
                      <span style={{ color: co.expired ? "var(--risk-red)" : "var(--risk-amber)", fontWeight: 700 }}>
                        {co.expired
                          ? `TCO expired ${co.tco_expiry_date ? fmtDate(co.tco_expiry_date) : ""}`
                          : `TCO expires ${co.tco_expiry_date ? fmtDate(co.tco_expiry_date) : "~90 days after issuance"}`}
                      </span>
                    </div>

                </div>
              </div>
            </div>
          )}
          {hasBoilers && (
            <div className="rp-card" style={{ marginBottom: 16 }}>
              <div style={{ padding: "12px 20px 8px", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--slate)", borderBottom: "1px solid var(--navy-10)" }}>
                Boilers — {overdueBoilers.length} overdue device{overdueBoilers.length !== 1 ? "s" : ""}
              </div>
              <div className="rp-device-grid">
                {overdueBoilers.map((b: any, i: number) => {
                  const overdue = b.missed_years > 1;
                  return (
                    <div className="rp-device-row" key={i}>
                      <span className="rp-device-id">{b.id}</span>
                      <span className={`rp-device-status ${overdue ? "warn" : "ok"}`}>{overdue ? "Overdue" : "Current"}</span>
                      <span className="rp-device-date" style={{ color: !b.last_insp ? "var(--risk-amber)" : overdue ? "var(--risk-red)" : "var(--slate)" }}>
                        {b.last_insp ? <>Last insp: {fmtDate(b.last_insp)}{overdue && <span style={{ marginLeft: 8 }}>· {b.missed_years.toFixed(1)}yr ago</span>}</> : "No inspection on record"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {hasElevators && (
            <div className="rp-card">
              <div style={{ padding: "12px 20px 8px", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--slate)", borderBottom: "1px solid var(--navy-10)" }}>
                Elevators — {overdueElevators.length} overdue device{overdueElevators.length !== 1 ? "s" : ""}
              </div>
              <div className="rp-device-grid">
                {overdueElevators.map((e: any, i: number) => {
                  const overdue = e.missed_years > 1;
                  return (
                    <div className="rp-device-row" key={i}>
                      <span className="rp-device-id">#{e.id}</span>
                      <span className={`rp-device-status ${overdue ? "warn" : "ok"}`}>{overdue ? "Overdue" : "Current"}</span>
                      <div className="rp-device-date">
                        <div style={{ color: e.cat1_date ? (overdue ? "var(--risk-red)" : "var(--slate)") : "var(--risk-amber)" }}>CAT1: {e.cat1_date ? fmtDate(e.cat1_date) : "None on record"}</div>
                        <div style={{ color: e.pvt_date ? (overdue ? "var(--risk-red)" : "var(--slate)") : "var(--risk-amber)" }}>PVT: {e.pvt_date ? fmtDate(e.pvt_date) : "None on record"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


// ─── Main ReportPage ──────────────────────────────────────────────────────────
interface ReportPageProps {
  building?: Building;
  email?: string;
  onReset?: () => void;
  onGoRisk?: () => void;
}

export default function ReportPage(_props: ReportPageProps) {


  const [building, setBuilding] = useState<Building | null>(null);
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [features, setFeatures] = useState<BuildingFeatures | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [devices, setDevices] = useState<any>({ boilers: [], elevators: [] });
  const [co, setCo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const payload = (window as any).__halfaveBldg;
      if (!payload) throw new Error("No building data found.");

      const b = payload.building ?? {};
      const sc = payload.score ?? {};
      const feat = payload.features ?? {};
      const viols = payload.violations ?? {};
      const devs = payload.devices ?? { boilers: [], elevators: [] };
      const coData = payload.co ?? null;

      setBuilding({
        id: `bin-${b.bin}`,
        bin: b.bin,
        bbl: b.bbl ?? null,
        address: b.address ?? "",
        borough: b.borough ?? null,
        stories: b.stories ? Number(b.stories) : null,
        unit_count: b.units ? Number(b.units) : null,
        year_built: b.yearBuilt ? Number(b.yearBuilt) : null,
        zipcode: b.zipcode ?? null,
        management_program: b.managementProgram ?? null,
      });

      setRiskScore({
        health_score: sc.healthScore,
        risk_score: sc.healthScore ?? 0,
        risk_bucket: sc.riskBucket ?? "Watch",
        percentile: sc.percentile ?? 0,
        top_drivers: undefined,
      });

      setFeatures({
        open_violations:           feat.open_violations           ?? 0,
        recent_12m_violations:     feat.recent_12m_violations     ?? 0,
        severity_points:           feat.severity_points           ?? 0,
        avg_open_age_days:         feat.avg_open_age_days         ?? 0,
        violation_density:         feat.violation_density         ?? 0,
        avg_resolution_days:       feat.avg_resolution_days       ?? 0,
        resolution_rate:           feat.resolution_rate           ?? 0,
        expired_tco:               feat.expired_tco               ?? false,
        boiler_count:              feat.boiler_count              ?? 0,
        boiler_avg_missed_years:   feat.boiler_avg_missed_years   ?? 0,
        elevator_count:            feat.elevator_count            ?? 0,
        elevator_avg_missed_years: feat.elevator_avg_missed_years ?? 0,
      });

      // Flatten violations from { hpd: { open, closed }, dob: ... } into Violation[]
      const flattenAgency = (arr: any[], agency: string): Violation[] =>
        (arr ?? []).map((v: any) => ({
          id:             String(v.id ?? ""),
          agency:         agency as Violation["agency"],
          source:         agency,
          severity:       v.cls ?? undefined,
          violation_type: v.desc ?? undefined,
          description:    v.desc ?? undefined,
          is_open:        v.isOpen ?? false,
          issue_date:     v.date ?? undefined,
          close_date:     v.closeDate ?? undefined,
          balance_due:    v.penalty ?? undefined,
        }));

      const allViolations: Violation[] = [
        ...flattenAgency([...(viols.hpd?.open ?? []),  ...(viols.hpd?.closed ?? [])],  "HPD"),
        ...flattenAgency([...(viols.dob?.open ?? []),  ...(viols.dob?.closed ?? [])],  "DOB"),
        ...flattenAgency([...(viols.ecb?.open ?? []),  ...(viols.ecb?.closed ?? [])],  "ECB"),
      ];

      setViolations(allViolations);
      setDevices(devs);
      setCo(coData);
    } catch (e: any) {
      setError(e?.message || "Failed to load report.");
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <>
        <style>{CSS}</style>
        <div className="rp-root">
          <div className="rp-loading">
            <div className="rp-spinner" />
            <span>LOADING REPORT</span>
          </div>
        </div>
      </>
    );
  }

  if (error || !building) {
    return (
      <>
        <style>{CSS}</style>
        <div className="rp-root">
          <div className="rp-loading">
            <span style={{ color: "var(--risk-red)" }}>⚠ {error || "Report unavailable"}</span>
          </div>
        </div>
      </>
    );
  }

  const rs = riskScore;
  const pct = rs?.percentile ?? 0;
  const score = rs?.health_score ?? rs?.risk_score ?? 0;
  const bucket = score >= 80 ? "Healthy" : score >= 60 ? "Good" : score >= 40 ? "Fair" : "Watch";

  const openViolations = features?.open_violations ?? violations.filter((v) => v.is_open).length;

  // Financial exposure

  const scoreColor = riskColor(score);

  return (
    <>
      <style>{CSS}</style>
      <div className="rp-root">
        {/* ── HERO ── */}
        <div className="rp-hero">
          <div className="rp-hero-inner">
            <div className="rp-hero-eyebrow">NYC Building Health Index</div>
            <div className="rp-hero-address">{building.address}</div>
            <div className="rp-hero-meta">
              <span>{BOROUGH_NAMES[String(building.borough)] ?? "NYC"}</span>
              {building.zipcode && <span>{building.zipcode}</span>}
              {building.stories && <span>{building.stories} stories</span>}
              {building.unit_count && <span>{building.unit_count} units</span>}
              {building.year_built && <span>Built {building.year_built}</span>}
              {building.bin && <span>BIN {building.bin}</span>}
            </div>
            <p className="rp-hero-summary">
              {building.address.split(',')[0]} has a health index of{" "}
              <strong style={{ color: scoreColor }}>{score} — {bucket}</strong>,
              {pct > 50
                ? <> ranking in the <strong>{pct >= 99 ? "99th" : `${pct.toFixed(0)}th`} percentile</strong> — better than {pct.toFixed(0)}% of comparable NYC buildings.</>
                : <> ranking in the <strong>{pct.toFixed(0)}th percentile</strong> among comparable NYC buildings.</>
              }
              {openViolations > 0 && <> There {openViolations === 1 ? "is" : "are"} currently <strong>{openViolations} open violation{openViolations !== 1 ? "s" : ""}</strong> on record.</>}
            </p>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="rp-body">



          {/* ── COMPLIANCE ISSUES ── */}
          <ComplianceSection violations={violations} devices={devices} co={co} />

                    {/* ── FOOTER ── */}
          <div style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid var(--navy-10)",
            fontFamily: "var(--font-mono)",
            fontSize: 11,
            color: "var(--slate)",
            lineHeight: 1.6,
          }}>
            <div style={{ marginBottom: 4 }}>
              Data sourced from NYC HPD, DOB, and ECB open data. Report generated by{" "}
              <a href="https://halfave.co" style={{ color: "var(--navy)", textDecoration: "underline" }}>Half Ave</a>.
            </div>
            {building.bbl && <div>BBL: {building.bbl} · BIN: {building.bin}</div>}
            {building.management_program && (
              <div>Management Program: {building.management_program}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
