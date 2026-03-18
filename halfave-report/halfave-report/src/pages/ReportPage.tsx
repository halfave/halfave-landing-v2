import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
const sbPeer = createClient(
  "https://mjkkzniagexfooclqsjr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qa2t6bmlhZ2V4Zm9vY2xxc2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDc4OTUsImV4cCI6MjA4NjMyMzg5NX0.RuaeazBn_IFWfXOlQ0ZDDTPsnTApNGmE_WpPi0o52gQ"
).schema("analytics");

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
    background: #f7f4ef;
    padding: 48px 24px 40px;
    border-bottom: 1px solid rgba(17,30,48,0.08);
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
  .rp-root { background: #f7f4ef; }

  /* ── SECTION ── */
  .rp-section { margin-bottom: 24px; background: #fff; border-radius: 20px; padding: 2rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
  .rp-section-title {
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* ── CARD ── */
  .rp-card {
    background: #f9fafb;
    border-radius: 12px;
    border: 1px solid rgba(17,30,48,0.06);
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
    background: rgba(17,30,48,0.06);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(17,30,48,0.06);
  }
  .rp-stat {
    background: #f9fafb;
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
    border: 1px solid rgba(17,30,48,0.06);
    border-radius: 12px;
    overflow: hidden;
    background: #fff;
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

  /* ── PEER METRICS TABLE ── */
  .rp-peer-table { width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: 12px; }
  .rp-peer-table th {
    text-align: left; padding: 10px 16px; font-size: 10px; letter-spacing: 0.08em;
    text-transform: uppercase; color: #9ca3af; border-bottom: 1px solid rgba(17,30,48,0.08);
    font-weight: 600; background: #f9fafb;
  }
  .rp-peer-table td { padding: 12px 16px; border-bottom: 1px solid rgba(17,30,48,0.06); color: var(--navy); vertical-align: middle; }
  .rp-peer-table tr:last-child td { border-bottom: none; }
  .rp-peer-table tr.you-row td { background: rgba(17,30,48,0.03); font-weight: 600; }
  .rp-peer-delta-better { color: var(--risk-green); font-size: 10px; margin-left: 6px; }
  .rp-peer-delta-worse  { color: var(--risk-red);   font-size: 10px; margin-left: 6px; }

  /* ── HEALTH SCORE CHART ── */
  .rp-chart-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .rp-chart-cell {
    border-radius: 10px; padding: 14px 16px;
    display: flex; flex-direction: column; gap: 6px;
  }
  .rp-chart-cell-label { font-family: var(--font-mono); font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #9ca3af; }
  .rp-chart-cell-score { font-family: var(--font-serif); font-size: 1.8rem; font-weight: 600; line-height: 1; }
  .rp-chart-cell-sub { font-family: var(--font-mono); font-size: 10px; color: #9ca3af; }
  .rp-chart-bar { height: 4px; border-radius: 2px; background: rgba(0,0,0,0.08); overflow: hidden; margin-top: 4px; }
  .rp-chart-bar-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
  @media (max-width: 600px) { .rp-chart-grid { grid-template-columns: repeat(2, 1fr); } }

  /* ── LOAD MORE ── */
  .rp-load-more {
    display: block;
    width: 100%;
    padding: 12px;
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.06em;
    background: #f9fafb;
    border: none;
    border-top: 1px solid rgba(17,30,48,0.06);
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
  const [peerData, setPeerData] = useState<any[]>([]);
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

      // Fetch peer comparison data from Supabase
      try {
        const { data: peer } = await sbPeer
          .from("building_features")
          .select(`
            violation_density, avg_open_age_days, avg_resolution_days,
            buildings!inner(borough, unit_count, year_built)
          `);
        if (peer) setPeerData(peer);
      } catch { /* non-critical */ }

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

                    {/* ── PEER METRICS TABLE ── */}
          {features && (
            <div className="rp-section">
              <div className="rp-section-title">How You Compare to Peer Buildings</div>
              {(() => {
                const b = (window as any).__halfaveBldg?.building;
                const unitCount = b?.units ? Number(b.units) : building.unit_count ?? 0;
                const yearBuilt = b?.yearBuilt ? Number(b.yearBuilt) : building.year_built ?? 0;
                const borough = building.borough ? Number(building.borough) : 0;

                const unitBand = unitCount <= 10 ? 'Small (1-10)' : unitCount <= 50 ? 'Medium (11-50)' : unitCount <= 200 ? 'Large (51-200)' : 'XLarge (200+)';
                const era = yearBuilt < 1945 ? 'Pre-war' : yearBuilt < 1980 ? 'Post-war' : 'Modern';

                // Filter peer data to matching group
                type PeerRow = { violation_density: number; avg_open_age_days: number; avg_resolution_days: number; buildings: { borough: number; unit_count: number; year_built: number } };
                const peers = (peerData as any[]).filter((r: any) => {
                  const rb = r.buildings;
                  if (!rb) return false;
                  const rUnits = rb.unit_count ?? 0;
                  const rYear = rb.year_built ?? 0;
                  const rUnitBand = rUnits <= 10 ? 'Small (1-10)' : rUnits <= 50 ? 'Medium (11-50)' : rUnits <= 200 ? 'Large (51-200)' : 'XLarge (200+)';
                  const rEra = rYear < 1945 ? 'Pre-war' : rYear < 1980 ? 'Post-war' : 'Modern';
                  return rUnitBand === unitBand && rEra === era && rb.borough === borough;
                });

                const avg = (key: string) => peers.length > 0
                  ? peers.reduce((s: number, r: any) => s + (Number(r[key]) || 0), 0) / peers.length
                  : null;

                const peerDensity   = avg('violation_density');
                const peerOpenAge   = avg('avg_open_age_days');
                const peerResolveDays = avg('avg_resolution_days');

                const myDensity     = features.violation_density;
                const myOpenAge     = features.avg_open_age_days;
                const myResolveDays = features.avg_resolution_days;

                const delta = (mine: number, peer: number | null, lowerBetter = true) => {
                  if (peer == null) return null;
                  const diff = mine - peer;
                  if (Math.abs(diff) < 0.01) return null;
                  const better = lowerBetter ? diff < 0 : diff > 0;
                  return { diff, better };
                };

                const Row = ({ label, mine, peer, fmt }: { label: string; mine: number; peer: number | null; fmt: (n: number) => string }) => {
                  const d = delta(mine, peer);
                  return (
                    <tr>
                      <td style={{ color: '#6b7280' }}>{label}</td>
                      <td className="you-row" style={{ fontWeight: 700 }}>{fmt(mine)}</td>
                      <td style={{ color: '#6b7280' }}>{peer != null ? fmt(peer) : '—'}</td>
                      <td>
                        {d && (
                          <span className={d.better ? 'rp-peer-delta-better' : 'rp-peer-delta-worse'}>
                            {d.better ? '▼' : '▲'} {fmt(Math.abs(d.diff))} {d.better ? 'better' : 'worse'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                };

                return (
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>
                      Peer group: <strong style={{ color: 'var(--navy)' }}>{unitBand} · {era} · {['','Manhattan','Bronx','Brooklyn','Queens','Staten Island'][borough] || 'NYC'}</strong>
                      {peers.length > 0 && <span style={{ marginLeft: 8 }}>({peers.length} buildings)</span>}
                    </div>
                    <table className="rp-peer-table">
                      <thead>
                        <tr>
                          <th>Metric</th>
                          <th>This building</th>
                          <th>Peer average</th>
                          <th>Difference</th>
                        </tr>
                      </thead>
                      <tbody>
                        <Row label="Violation density (violations/unit)" mine={myDensity} peer={peerDensity} fmt={(n) => n.toFixed(2)} />
                        <Row label="Avg age of open violations" mine={myOpenAge} peer={peerOpenAge} fmt={(n) => `${Math.round(n)}d`} />
                        <Row label="Avg time to close violations" mine={myResolveDays} peer={peerResolveDays} fmt={(n) => `${Math.round(n)}d`} />
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── HEALTH SCORE BY SIZE & AGE ── */}
          {peerData.length > 0 && (
            <div className="rp-section">
              <div className="rp-section-title">Health Scores by Building Type & Borough</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#9ca3af', marginBottom: 20 }}>
                Average health index across NYC buildings, grouped by size and age. Color = borough.
              </div>
              {(() => {
                const BOROUGH_COLORS: Record<number, string> = { 1: '#111e30', 2: '#c4533a', 3: '#3a7d5e', 4: '#c9a227', 5: '#7a8fa6' };
                const BOROUGH_BG: Record<number, string>     = { 1: '#f0f2f5', 2: '#fef2f2', 3: '#edf5f0', 4: '#fefce8', 5: '#f1f5f9' };
                const BOROUGH_LABELS: Record<number, string> = { 1: 'Manhattan', 2: 'Bronx', 3: 'Brooklyn', 4: 'Queens', 5: 'Staten Island' };
                const SIZE_ORDER = ['Small (1-10)', 'Medium (11-50)', 'Large (51-200)', 'XLarge (200+)'];
                const ERA_ORDER  = ['Pre-war', 'Post-war', 'Modern'];

                // Aggregate peerData into groups
                type GroupKey = string;
                const groups: Record<GroupKey, { scores: number[]; count: number; borough: number; size: string; era: string }> = {};

                (peerData as any[]).forEach((r: any) => {
                  const rb = r.buildings;
                  if (!rb) return;
                  const units = rb.unit_count ?? 0;
                  const year  = rb.year_built ?? 0;
                  const boro  = rb.borough ?? 0;
                  const size  = units <= 10 ? 'Small (1-10)' : units <= 50 ? 'Medium (11-50)' : units <= 200 ? 'Large (51-200)' : 'XLarge (200+)';
                  const era   = year < 1945 ? 'Pre-war' : year < 1980 ? 'Post-war' : 'Modern';
                  const key   = `${size}|${era}|${boro}`;
                  if (!groups[key]) groups[key] = { scores: [], count: 0, borough: boro, size, era };
                  // We don't have health_score in peerData — use violation_density as proxy, skip for now
                  groups[key].count++;
                });

                // Use the hardcoded Supabase aggregate data we already queried
                const CHART_DATA = [
                  {size:'Small (1-10)',era:'Pre-war',borough:1,avg:77.5,count:2937},{size:'Small (1-10)',era:'Pre-war',borough:2,avg:64.7,count:4070},{size:'Small (1-10)',era:'Pre-war',borough:3,avg:76.3,count:5798},{size:'Small (1-10)',era:'Pre-war',borough:4,avg:83.4,count:4125},{size:'Small (1-10)',era:'Pre-war',borough:5,avg:77.3,count:610},
                  {size:'Small (1-10)',era:'Post-war',borough:1,avg:78.3,count:31},{size:'Small (1-10)',era:'Post-war',borough:2,avg:85.5,count:190},{size:'Small (1-10)',era:'Post-war',borough:3,avg:82.9,count:55},{size:'Small (1-10)',era:'Post-war',borough:4,avg:91.2,count:946},{size:'Small (1-10)',era:'Post-war',borough:5,avg:90.4,count:276},
                  {size:'Small (1-10)',era:'Modern',borough:1,avg:80.4,count:47},{size:'Small (1-10)',era:'Modern',borough:2,avg:74.5,count:104},{size:'Small (1-10)',era:'Modern',borough:3,avg:87.3,count:163},{size:'Small (1-10)',era:'Modern',borough:4,avg:84.0,count:1065},{size:'Small (1-10)',era:'Modern',borough:5,avg:88.7,count:219},
                  {size:'Medium (11-50)',era:'Pre-war',borough:1,avg:71.1,count:3267},{size:'Medium (11-50)',era:'Pre-war',borough:2,avg:46.7,count:2720},{size:'Medium (11-50)',era:'Pre-war',borough:3,avg:56.3,count:2713},{size:'Medium (11-50)',era:'Pre-war',borough:4,avg:71.2,count:1584},{size:'Medium (11-50)',era:'Pre-war',borough:5,avg:62.2,count:28},
                  {size:'Medium (11-50)',era:'Post-war',borough:1,avg:78.5,count:68},{size:'Medium (11-50)',era:'Post-war',borough:2,avg:63.4,count:111},{size:'Medium (11-50)',era:'Post-war',borough:3,avg:66.2,count:42},{size:'Medium (11-50)',era:'Post-war',borough:4,avg:76.2,count:577},{size:'Medium (11-50)',era:'Post-war',borough:5,avg:82.7,count:121},
                  {size:'Medium (11-50)',era:'Modern',borough:1,avg:84.3,count:89},{size:'Medium (11-50)',era:'Modern',borough:2,avg:71.3,count:203},{size:'Medium (11-50)',era:'Modern',borough:3,avg:81.1,count:172},{size:'Medium (11-50)',era:'Modern',borough:4,avg:77.5,count:587},{size:'Medium (11-50)',era:'Modern',borough:5,avg:80.6,count:80},
                  {size:'Large (51-200)',era:'Pre-war',borough:1,avg:74.8,count:718},{size:'Large (51-200)',era:'Pre-war',borough:2,avg:38.8,count:836},{size:'Large (51-200)',era:'Pre-war',borough:3,avg:53.0,count:612},{size:'Large (51-200)',era:'Pre-war',borough:4,avg:59.6,count:458},{size:'Large (51-200)',era:'Pre-war',borough:5,avg:70.6,count:13},
                  {size:'Large (51-200)',era:'Post-war',borough:1,avg:77.6,count:330},{size:'Large (51-200)',era:'Post-war',borough:2,avg:47.1,count:134},{size:'Large (51-200)',era:'Post-war',borough:3,avg:57.2,count:254},{size:'Large (51-200)',era:'Post-war',borough:4,avg:60.1,count:503},{size:'Large (51-200)',era:'Post-war',borough:5,avg:66.4,count:60},
                  {size:'Large (51-200)',era:'Modern',borough:1,avg:80.5,count:125},{size:'Large (51-200)',era:'Modern',borough:2,avg:67.2,count:45},{size:'Large (51-200)',era:'Modern',borough:3,avg:83.4,count:73},{size:'Large (51-200)',era:'Modern',borough:4,avg:81.7,count:88},{size:'Large (51-200)',era:'Modern',borough:5,avg:71.3,count:28},
                  {size:'XLarge (200+)',era:'Pre-war',borough:1,avg:65.5,count:80},{size:'XLarge (200+)',era:'Pre-war',borough:2,avg:76.8,count:8},{size:'XLarge (200+)',era:'Pre-war',borough:3,avg:89.7,count:7},{size:'XLarge (200+)',era:'Pre-war',borough:4,avg:56.4,count:5},
                  {size:'XLarge (200+)',era:'Post-war',borough:1,avg:71.6,count:213},{size:'XLarge (200+)',era:'Post-war',borough:2,avg:52.3,count:33},{size:'XLarge (200+)',era:'Post-war',borough:3,avg:80.5,count:32},{size:'XLarge (200+)',era:'Post-war',borough:4,avg:65.7,count:111},
                  {size:'XLarge (200+)',era:'Modern',borough:1,avg:78.9,count:117},{size:'XLarge (200+)',era:'Modern',borough:2,avg:68.4,count:23},{size:'XLarge (200+)',era:'Modern',borough:3,avg:92.6,count:116},{size:'XLarge (200+)',era:'Modern',borough:4,avg:87.8,count:81},
                ];

                const b = (window as any).__halfaveBldg?.building;
                const unitCount = b?.units ? Number(b.units) : building.unit_count ?? 0;
                const yearBuilt = b?.yearBuilt ? Number(b.yearBuilt) : building.year_built ?? 0;
                const myBoro    = building.borough ? Number(building.borough) : 0;
                const mySize    = unitCount <= 10 ? 'Small (1-10)' : unitCount <= 50 ? 'Medium (11-50)' : unitCount <= 200 ? 'Large (51-200)' : 'XLarge (200+)';
                const myEra     = yearBuilt < 1945 ? 'Pre-war' : yearBuilt < 1980 ? 'Post-war' : 'Modern';

                return SIZE_ORDER.map(size => (
                  <div key={size} style={{ marginBottom: 24 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#6b7280', marginBottom: 10 }}>
                      {size}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                      {ERA_ORDER.map(era => {
                        const rows = CHART_DATA.filter(d => d.size === size && d.era === era);
                        if (rows.length === 0) return null;
                        return (
                          <div key={era} style={{ background: '#f9fafb', borderRadius: 12, padding: '12px 14px' }}>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#9ca3af', marginBottom: 8, fontWeight: 600 }}>{era}</div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                              {rows.sort((a,b) => a.borough - b.borough).map(d => {
                                const isMe = d.size === mySize && d.era === myEra && d.borough === myBoro;
                                const color = BOROUGH_COLORS[d.borough] ?? '#7a8fa6';
                                const bg    = BOROUGH_BG[d.borough]    ?? '#f1f5f9';
                                return (
                                  <div key={d.borough} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 6, background: isMe ? bg : 'transparent', border: isMe ? `1px solid ${color}22` : '1px solid transparent' }}>
                                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#6b7280', flex: 1 }}>{BOROUGH_LABELS[d.borough]}</span>
                                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: isMe ? 700 : 600, color: isMe ? color : '#374151' }}>
                                      {d.avg}{isMe && ' ★'}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}

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
