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

  .rp-root { min-height: 100vh; background: #fff; }

  /* ── HERO ── */
  .rp-hero {
    background: #fff;
    padding: 48px 24px 40px;
    border-bottom: 1px solid rgba(17,30,48,0.08);
  }
  .rp-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
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
    font-size: clamp(18px, 2.5vw, 26px);
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
  .rp-body { max-width: 860px; margin: 0 auto; padding: 36px 24px 80px; font-family: 'Inter', -apple-system, sans-serif; background: #fff; }

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
    font-family: 'Inter', -apple-system, sans-serif;
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
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: var(--navy);
    line-height: 1;
  }
  .rp-stat-lbl {
    font-family: 'Inter', -apple-system, sans-serif;
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
    font-family: 'Inter', -apple-system, sans-serif;
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
    background: var(--risk-amber);
    color: #fff;
    font-weight: 700;
  }
  .rp-tab-btn.active .rp-tab-count {
    background: var(--risk-amber);
    color: #fff;
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
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
  }
  .rp-vsum-lbl {
    font-family: 'Inter', -apple-system, sans-serif;
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
    font-family: 'Inter', -apple-system, sans-serif;
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
  .rp-peer-table { width: 100%; border-collapse: collapse; font-family: 'Inter', -apple-system, sans-serif; font-size: 13px; }
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
  .rp-chart-cell-label { font-family: 'Inter', -apple-system, sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #9ca3af; }
  .rp-chart-cell-score { font-family: var(--font-serif); font-size: 1.8rem; font-weight: 600; line-height: 1; }
  .rp-chart-cell-sub { font-family: 'Inter', -apple-system, sans-serif; font-size: 10px; color: #9ca3af; }
  .rp-chart-bar { height: 4px; border-radius: 2px; background: rgba(0,0,0,0.08); overflow: hidden; margin-top: 4px; }
  .rp-chart-bar-fill { height: 100%; border-radius: 2px; transition: width 0.6s ease; }
  @media (max-width: 600px) { .rp-chart-grid { grid-template-columns: repeat(2, 1fr); } }

  /* ── LOAD MORE ── */
  .rp-load-more {
    display: block;
    width: 100%;
    padding: 12px;
    font-family: 'Inter', -apple-system, sans-serif;
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
    font-family: 'Inter', -apple-system, sans-serif;
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
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 12px;
    color: var(--navy);
  }
  .rp-peer-val {
    font-family: 'Inter', -apple-system, sans-serif;
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
    font-family: 'Inter', -apple-system, sans-serif;
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
    font-family: 'Inter', -apple-system, sans-serif;
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
    font-family: 'Inter', -apple-system, sans-serif;
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
    <div style={{ padding: "32px 20px", textAlign: "center", fontFamily: "'Inter', sans-serif", fontSize: 13, color: "var(--slate)" }}>
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
                  <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: 3, fontFamily: "'Inter', sans-serif", fontSize: 12 }}>Certificate of Occupancy</div>
                                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "var(--slate)" }}>
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
              <div style={{ padding: "12px 20px 8px", fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--slate)", borderBottom: "1px solid var(--navy-10)" }}>
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
              <div style={{ padding: "12px 20px 8px", fontFamily: "'Inter', sans-serif", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" as const, color: "var(--slate)", borderBottom: "1px solid var(--navy-10)" }}>
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
    <div style={{
      marginTop: 20, padding: '14px 16px', borderRadius: 10,
      background: '#111e30', display: 'flex', alignItems: 'center', gap: 14,
    }}>
      <img src="data:image/png;base64,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D9lsFgsWLADQPDmvdGJu2zZ+/OMfo7GxUb8nVbFI65gp457nabvStBWvvPJKAC3Ppul0MAs0mLo/5rP7wx/+UB8fQCTtqKvTt29fHHvssbotmZHiSinkcjlUVVXh6quvjly77vDdSNeFIx8hHYht25g6dWrEyDDFumzbxsMPP4zly5droTszEqaS4+fzedx9990RfRY5PlCqMO/7PlzXhed5mDp1Kqqrq0uO211WKwghhHQOMhlRSkXSZwFgzJgx+u9isagn+V999RUWLlxoceLcNXBdF77v46ijjlLV1dW60hCASFRSoVDAiy++aLUn2kUWmiQC6oYbboDv+xVHzOTzeTiOgxEjRmCjjTbSlZbKVdohpUip9nhql7kIOGfOHOvjjz/Wz62p22SK7YptKhFQ8vyOHTsWQ4cOjWj3dJeqRscff7zq16+f/p6mXpVt28hkMvB9HzNnzrSkzUn7pbgu+a7Q8UJIB1JXV4ejjz5aryZIyKe8tm0bd911V2Sf9njTxfC9+eabS/aXnGjzPc/z9P9PJpM4+uijdQk9gHnThBBCKieRSOiJi0RGAMDIkSMj28jE7oknnohEL5DOQ5wuSilMmDABuVyubPUg3/fx7rvvYunSpe2qWGNG7iaTSTz22GPWl19+GbFNWiOdTsP3fViWhTFjxiigxRnEdKPKMJ9NKfecz+e1I7ShoQELFizQ11UcLL7vaw0guVemE0bS02pra7H//vsrx3F0e+ouTtXTTjsNQLScOhAVb77uuut0SXWgJf2O4rrku7JeZlmmcFM8VE08pL31R66DTMylA+AEuHsQjwxxXVdHqiQSCZx00knKvJemdot08vfcc48WODOdJpWkG8kxnn76aevLL79c4+emxkv8/M877zwVj5KJb0cIId8VGd8A6FVrE+kzzZXS7lgdo7ch0SziWJGqeZtssgmGDx8OABHdMgC49957AXDi3BUQTZ5+/fph/Pjx2tEhmMKsV111VSQSwnym14TYR6lUCoVCAbZt44477oDneRXZuJ7n6cn8z372M30+iUSCGkEVItcpCIKSSCHpY//85z9bppMNaOmLzQioeDSL3MOzzjoLQRBE2k5XmsPI95TfVVVVGDJkCA455BCdWuU4jr5WZjTLddddV5LGbx6L9HzMBYU1vScaVKaO55ro8CdDHAwNDQ26PF0ymYyEdPXm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qv+zuO4MH83KLvj1lvzxxuY7uVxOLr744qbjWuM8Zqj5bbP5rP+wz85xP4BaKpXcHNf/N1YE1wxUS8vel3+8+mOyfV2v1/vdn4vsjq2ISHLi5x/YEydOlL/8y79U67Jhv7zVJ6nN3rC9Cfv+Cy+8oDfffLOedtppatk2jReIYrEohUIhcQKPhBOw8T02DsJnn322PvbYY/12uG3jVvlBm97eXvfztm/frrfeeqt7CuJHno3/JLZZa9u9aahsgXQ63bSP+gc/+EG5/PLL9ZVXXnHbpXGC0oo4jhMn4Le//W3df//9+70/+912fO4rhWP9iYV91p/97Gf9tmez7dbq+LBjxw739auvvqrf+9739IwzznA33ram2n8PI624WmMmj8lkMtLR0SGnn366G2MHKsz1TtlExi4Q/oTUvzA1G3ca96VdqJrx971/7jTLkPHHLfvccRzrBz/4wb2xm951fn0kOwb8a4AFOmzcmDZtmvzoRz9y54R/4W4W2BrqPPP3kX29ePFivfzyy902bjau+uOXn1k4krJN0aexRpLdCG3ZsiVxPpurrrqqtZaXaJmfMebPvSZMmCAXXHCBPv744+58biWT3M77xtfaGP/888/rySefrJlMJvFAc6BMt5GqWRDDtvNpp52W2DZ+589Wr61+wMXGT7uOLViwQM877zxXKy2XyyXGUgsUWEDbv+6PlppljZmdIskH67Nnz256bNv9SxRFrluNf974D16xd1m2uhWy9e/Rba5j3zvggAPkpz/9ab8gR7NjoJVztLE250BzoTAMm/6+ge6xmz3wUu1fjNv/OYPFRGq1mq5YscLVLQza29ult7dXurq65KKLLtKuri6J41g+8pGPyLRp0+QDH/iAG0ys5kgcx1KtVhM3EwOJoihxkjSuSxfZvda/XC679X+///3vpVgsyv/+7//Kiy++6Oof/O53v5Nly5YFqVRqRK1T/eY3v6mqKrVaTU444QQ54IAD5NhjjxWR3WvZyuVyYps2rl8bim1H///T6bRUKhV3o1qr1WTt2rWydetW6e7ulhUrVkihUJBarSYvvPCCLFq0KMhms5LP56Wnp+dd+vRvn639tPWeHR0dUi6XZezYsXL22Wfr1KlT3bE4Z84cmTp1qkybNi3Rz11kd62DWq0muVyu6XE4kFqtlggGbtmyRZ599ll54okn3M9Op9Py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" alt="Half/Ave" style={{ height: 24, width: "auto", display: "block" }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#f7f4ef', fontWeight: 700, marginBottom: 3 }}>
          Get ahead of these violations with Half Ave
        </div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'rgba(247,244,239,0.7)' }}>
          Track resolution status, assign work orders, and get alerts on new filings — all in one place.
        </div>
      </div>
      <a href="https://halfave.co" style={{
        fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
        color: '#111e30', background: '#f7f4ef',
        padding: '8px 16px', borderRadius: 6, textDecoration: 'none', whiteSpace: 'nowrap' as const,
        flexShrink: 0,
      }}>
        Get early access →
      </a>
    </div>
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
      (async () => {
        try {
          const { data: peer } = await sbPeer
            .from("building_features")
            .select(`
              violation_density, avg_open_age_days, avg_resolution_days,
              buildings!inner(borough, unit_count, year_built)
            `);
          if (peer) setPeerData(peer);
        } catch { /* non-critical */ }
      })();

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
            <div className="rp-hero-eyebrow">NYC Building Health Score</div>
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
              {(() => {
                const addr = building.address.split(',')[0];
                const openViols = violations.filter(v => v.is_open);
                const classC = openViols.filter(v => v.severity === 'C').length;
                const classB = openViols.filter(v => v.severity === 'B').length;
                const density = features?.violation_density ?? 0;
                const resolvedays = features?.avg_resolution_days ?? 0;

                // Biggest violation type
                const typeCounts: Record<string, number> = {};
                openViols.forEach(v => {
                  const t = v.violation_type?.slice(0, 40) || 'other';
                  typeCounts[t] = (typeCounts[t] || 0) + 1;
                });

                // Percentile framing — never say "50th percentile"
                const pctLabel = pct >= 75
                  ? `top ${100 - Math.round(pct)}% of`
                  : pct >= 50
                  ? 'above average among'
                  : pct >= 25
                  ? 'below average among'
                  : `bottom ${Math.round(pct)}% of`;

                // Severity framing
                const severityNote = classC > 0
                  ? `${classC} Class C (emergency) violation${classC > 1 ? 's' : ''} account for the highest-severity exposure`
                  : classB > 0
                  ? `${classB} Class B violation${classB > 1 ? 's' : ''} represent the primary compliance burden`
                  : openViolations > 0
                  ? `${openViolations} open violation${openViolations > 1 ? 's' : ''} on record, all Class A`
                  : null;

                // Resolution framing
                const resolutionNote = resolvedays > 900
                  ? `, and historically takes over ${Math.round(resolvedays/365 * 10)/10} years to resolve violations`
                  : resolvedays > 365
                  ? `, with an average resolution time of ${Math.round(resolvedays/30)} months`
                  : resolvedays > 0
                  ? `, with violations typically resolved in ${Math.round(resolvedays)} days`
                  : '';

                // Density framing
                const densityNote = density > 1
                  ? 'high violation density relative to its unit count'
                  : density > 0.3
                  ? 'moderate violation density'
                  : density > 0
                  ? 'low violation density relative to its size'
                  : null;

                return (
                  <>
                    <strong style={{ color: 'var(--navy)' }}>{addr}</strong> holds a Health Score of{' '}
                    <strong style={{ color: scoreColor }}>{score} — {bucket}</strong>, placing it in the{' '}
                    <strong style={{ color: scoreColor }}>{pctLabel} comparable NYC buildings</strong>.{' '}
                    {openViolations === 0
                      ? 'The building carries no open violations, reflecting strong compliance performance.'
                      : <>
                          {severityNote && <>{severityNote}{resolutionNote}. </>}
                          {densityNote && <>The building shows {densityNote}. </>}
                        </>
                    }
                    {score < 60 && ' This score reflects material compliance risk that warrants active monitoring.'}
                    {score >= 80 && openViolations > 0 && ' Despite open violations, overall compliance posture remains strong.'}
                  </>
                );
              })()}
            </p>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="rp-body">



          {/* ── COMPLIANCE ISSUES ── */}
          <ComplianceSection violations={violations} devices={devices} co={co} />

                    {/* ── VIOLATION TREND ── */}
          {violations.length > 0 && (() => {
            const currentYear = new Date().getFullYear();
            const years = Array.from({length: 10}, (_, i) => currentYear - 9 + i);

            // Count open and closed violations per year (by issue_date)
            const counts = years.map(yr => {
              const yearViols = violations.filter(v => {
                if (!v.issue_date) return false;
                return new Date(v.issue_date).getFullYear() === yr;
              });
              return {
                yr,
                open:   yearViols.filter(v =>  v.is_open).length,
                closed: yearViols.filter(v => !v.is_open).length,
                total:  yearViols.length,
              };
            });

            const maxTotal = Math.max(...counts.map(c => c.total), 1);
            const W = 760, H = 200, PL = 36, PR = 20, PT = 16, PB = 40;
            const CW = W - PL - PR, CH = H - PT - PB;
            const barGroupW = CW / years.length;
            const barW = Math.min(48, barGroupW * 0.55);
            const yS = (n: number) => CH - (n / maxTotal) * CH;

            const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((maxTotal / 4) * i));

            return (
              <div className="rp-section">
                <div className="rp-section-title">Violation Trend — Last 5 Years</div>
                <div style={{ display: 'flex', gap: 20, marginBottom: 16, fontFamily: "'Inter', sans-serif", fontSize: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--risk-red)', opacity: 0.7 }} />
                    <span style={{ color: '#6b7280' }}>Open</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 12, height: 12, borderRadius: 3, background: '#d1d5db' }} />
                    <span style={{ color: '#6b7280' }}>Closed</span>
                  </div>
                </div>
                <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', display: 'block' }}>
                  {/* Y grid */}
                  {yTicks.map(t => (
                    <g key={t}>
                      <line x1={PL} y1={PT + yS(t)} x2={PL + CW} y2={PT + yS(t)}
                        stroke="rgba(17,30,48,0.06)" strokeWidth="1" />
                      <text x={PL - 6} y={PT + yS(t) + 4} textAnchor="end" fontSize="9"
                        fill="#9ca3af" fontFamily="monospace">{t}</text>
                    </g>
                  ))}
                  {/* Bars */}
                  {counts.map((c, i) => {
                    const cx = PL + i * barGroupW + barGroupW / 2;
                    const closedH = (c.closed / maxTotal) * CH;
                    const openH   = (c.open   / maxTotal) * CH;
                    const totalH  = closedH + openH;
                    return (
                      <g key={c.yr}>
                        {/* Closed (bottom, gray) */}
                        {c.closed > 0 && (
                          <rect x={cx - barW/2} y={PT + CH - closedH} width={barW} height={closedH}
                            fill="#d1d5db" rx="3" />
                        )}
                        {/* Open (top, red) */}
                        {c.open > 0 && (
                          <rect x={cx - barW/2} y={PT + CH - totalH} width={barW} height={openH}
                            fill="var(--risk-red)" fillOpacity="0.7" rx="3"
                            style={{ borderRadius: c.closed > 0 ? '3px 3px 0 0' : '3px' }} />
                        )}
                        {/* Total label */}
                        {c.total > 0 && (
                          <text x={cx} y={PT + CH - totalH - 5} textAnchor="middle"
                            fontSize="9" fill="#374151" fontFamily="monospace" fontWeight="600">
                            {c.total}
                          </text>
                        )}
                        {/* Year label */}
                        <text x={cx} y={PT + CH + 16} textAnchor="middle"
                          fontSize="10" fill="#6b7280" fontFamily="monospace">{c.yr}</text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            );
          })()}

                    {/* ── PEER METRICS TABLE ── */}
          {features && (
            <div className="rp-section">
              <div className="rp-section-title">How You Compare to Peer Buildings</div>
              {(() => {
                const b = (window as any).__halfaveBldg?.building;
                const unitCount = building.unit_count ?? (b?.units ? Number(b.units) : 0);
                const yearBuilt = building.year_built ?? (b?.yearBuilt ? Number(b.yearBuilt) : 0);
                const borough = building.borough ? Number(building.borough) : 0;

                const unitBand = unitCount <= 10 ? 'Small (1-10)' : unitCount <= 50 ? 'Medium (11-50)' : unitCount <= 200 ? 'Large (51-200)' : 'XLarge (200+)';
                const era = yearBuilt > 0 ? (yearBuilt < 1945 ? 'Pre-war' : yearBuilt < 1980 ? 'Post-war' : 'Modern') : null;

                // Filter peer data — if year built unknown, match only on size+borough
                const peers = (peerData as any[]).filter((r: any) => {
                  const rb = r.buildings;
                  if (!rb) return false;
                  const rUnits = rb.unit_count ?? 0;
                  const rYear = rb.year_built ?? 0;
                  const rUnitBand = rUnits <= 10 ? 'Small (1-10)' : rUnits <= 50 ? 'Medium (11-50)' : rUnits <= 200 ? 'Large (51-200)' : 'XLarge (200+)';
                  const rEra = rYear < 1945 ? 'Pre-war' : rYear < 1980 ? 'Post-war' : 'Modern';
                  if (rUnitBand !== unitBand || rb.borough !== borough) return false;
                  if (era === null) return true; // no year built — match size+borough only
                  return rEra === era;
                });

                const avg = (key: string) => peers.length > 0
                  ? peers.reduce((s: number, r: any) => s + (Number(r[key]) || 0), 0) / peers.length
                  : null;

                const peerDensity   = avg('violation_density');
                const peerOpenAge   = avg('avg_open_age_days');
                const peerResolveDays = avg('avg_resolution_days');

                const myDensity     = features.violation_density;
                // Calculate live from violations if edge function hasn't returned it
                const openViols = violations.filter(v => v.is_open && v.issue_date);
                const liveOpenAge = openViols.length > 0
                  ? openViols.reduce((s, v) => s + Math.max(0, (Date.now() - new Date(v.issue_date!).getTime()) / 86400000), 0) / openViols.length
                  : 0;
                const myOpenAge = features.avg_open_age_days > 0 ? features.avg_open_age_days : liveOpenAge;
                const myResolveDays = features.avg_resolution_days;

                const pctDelta = (mine: number | null, peer: number | null, lowerBetter = true) => {
                  if (mine == null || peer == null || peer === 0) return null;
                  const pct = ((mine - peer) / peer) * 100;
                  if (Math.abs(pct) < 1) return null;
                  const better = lowerBetter ? pct < 0 : pct > 0;
                  return { pct: Math.round(Math.abs(pct)), better };
                };

                const Row = ({ label, mine, peer, fmt }: { label: string; mine: number | null; peer: number | null; fmt: (n: number) => string }) => {
                  const d = pctDelta(mine, peer);
                  return (
                    <tr>
                      <td style={{ color: '#6b7280' }}>{label}</td>
                      <td style={{ fontWeight: 700, color: 'var(--navy)' }}>{mine != null ? fmt(mine) : <span style={{ color: '#9ca3af', fontWeight: 400 }}>—</span>}</td>
                      <td style={{ color: '#6b7280' }}>{peer != null ? fmt(peer) : '—'}</td>
                      <td>
                        {d && (
                          <span className={d.better ? 'rp-peer-delta-better' : 'rp-peer-delta-worse'}>
                            {d.better ? '▼' : '▲'} {d.pct}% {d.better ? 'better' : 'worse'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                };

                return (
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#9ca3af', marginBottom: 16 }}>
                      Peer group: <strong style={{ color: 'var(--navy)' }}>{unitBand}{era ? ` · ${era}` : ''} · {['','Manhattan','Bronx','Brooklyn','Queens','Staten Island'][borough] || 'NYC'}</strong>
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
                        <Row label="Avg age of open violations" mine={myOpenAge > 0 ? myOpenAge : null} peer={peerOpenAge} fmt={(n) => `${Math.round(n)}d`} />
                        <Row label="Avg time to close violations" mine={myResolveDays > 0 ? myResolveDays : null} peer={peerResolveDays} fmt={(n) => `${Math.round(n)}d`} />
                      </tbody>
                    </table>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── HEALTH SCORE CHARTS ── */}
          {(() => {
            const SIZE_DATA = [{"decade":1900,"size_band":"Large","avg_score":68.5,"count":108},{"decade":1900,"size_band":"Medium","avg_score":65.5,"count":1912},{"decade":1900,"size_band":"Small","avg_score":73.9,"count":2903},{"decade":1900,"size_band":"XLarge","avg_score":57.8,"count":9},{"decade":1910,"size_band":"Large","avg_score":67.0,"count":153},{"decade":1910,"size_band":"Medium","avg_score":56.8,"count":2247},{"decade":1910,"size_band":"Small","avg_score":73.7,"count":2236},{"decade":1910,"size_band":"XLarge","avg_score":61.5,"count":8},{"decade":1920,"size_band":"Large","avg_score":52.1,"count":1356},{"decade":1920,"size_band":"Medium","avg_score":59.1,"count":3609},{"decade":1920,"size_band":"Small","avg_score":76.2,"count":5043},{"decade":1920,"size_band":"XLarge","avg_score":70.4,"count":44},{"decade":1930,"size_band":"Large","avg_score":55.7,"count":742},{"decade":1930,"size_band":"Medium","avg_score":57.7,"count":1773},{"decade":1930,"size_band":"Small","avg_score":72.3,"count":3772},{"decade":1930,"size_band":"XLarge","avg_score":69.4,"count":34},{"decade":1940,"size_band":"Large","avg_score":60.4,"count":325},{"decade":1940,"size_band":"Medium","avg_score":70.9,"count":246},{"decade":1940,"size_band":"Small","avg_score":83.4,"count":467},{"decade":1940,"size_band":"XLarge","avg_score":80.3,"count":28},{"decade":1950,"size_band":"Large","avg_score":63.4,"count":519},{"decade":1950,"size_band":"Medium","avg_score":78.4,"count":442},{"decade":1950,"size_band":"Small","avg_score":89.9,"count":407},{"decade":1950,"size_band":"XLarge","avg_score":67.4,"count":69},{"decade":1960,"size_band":"Large","avg_score":62.4,"count":598},{"decade":1960,"size_band":"Medium","avg_score":68.6,"count":220},{"decade":1960,"size_band":"Small","avg_score":90.9,"count":557},{"decade":1960,"size_band":"XLarge","avg_score":66.0,"count":207},{"decade":1970,"size_band":"Large","avg_score":66.0,"count":88},{"decade":1970,"size_band":"Medium","avg_score":77.8,"count":141},{"decade":1970,"size_band":"Small","avg_score":89.4,"count":404},{"decade":1970,"size_band":"XLarge","avg_score":72.9,"count":89},{"decade":1980,"size_band":"Large","avg_score":71.7,"count":126},{"decade":1980,"size_band":"Medium","avg_score":71.6,"count":179},{"decade":1980,"size_band":"Small","avg_score":87.7,"count":352},{"decade":1980,"size_band":"XLarge","avg_score":73.6,"count":80},{"decade":1990,"size_band":"Large","avg_score":73.3,"count":34},{"decade":1990,"size_band":"Medium","avg_score":67.7,"count":85},{"decade":1990,"size_band":"Small","avg_score":86.7,"count":100},{"decade":1990,"size_band":"XLarge","avg_score":84.3,"count":15},{"decade":2000,"size_band":"Large","avg_score":81.4,"count":78},{"decade":2000,"size_band":"Medium","avg_score":76.1,"count":377},{"decade":2000,"size_band":"Small","avg_score":82.7,"count":926},{"decade":2000,"size_band":"XLarge","avg_score":84.5,"count":51},{"decade":2010,"size_band":"Large","avg_score":84.3,"count":79},{"decade":2010,"size_band":"Medium","avg_score":81.7,"count":325},{"decade":2010,"size_band":"Small","avg_score":86.0,"count":148},{"decade":2010,"size_band":"XLarge","avg_score":87.4,"count":109},{"decade":2020,"size_band":"Large","avg_score":90.5,"count":40},{"decade":2020,"size_band":"Medium","avg_score":85.3,"count":162},{"decade":2020,"size_band":"Small","avg_score":83.6,"count":63},{"decade":2020,"size_band":"XLarge","avg_score":93.4,"count":84}];
            const BOX_DATA = [{"borough":1,"count":8022,"min":2.0,"p25":64.0,"median":83.0,"p75":91.0,"max":100.0,"avg":74.5},{"borough":2,"count":8477,"min":6.0,"p25":27.0,"median":59.0,"p75":85.0,"max":100.0,"avg":56.8},{"borough":3,"count":10037,"min":8.0,"p25":51.0,"median":79.0,"p75":91.0,"max":100.0,"avg":69.5},{"borough":4,"count":10130,"min":8.0,"p25":70.0,"median":89.0,"p75":96.0,"max":100.0,"avg":79.1},{"borough":5,"count":1439,"min":8.0,"p25":71.5,"median":91.0,"p75":100.0,"max":100.0,"avg":81.2}];

            const BORO_COLORS: Record<number,string> = {1:'#111e30',2:'#c4533a',3:'#3a7d5e',4:'#c9a227',5:'#7a8fa6'};
            const BORO_BG: Record<number,string>     = {1:'#f0f2f5',2:'#fef2f2',3:'#edf5f0',4:'#fefce8',5:'#f1f5f9'};
            const BORO_LABELS: Record<number,string> = {1:'Manhattan',2:'Bronx',3:'Brooklyn',4:'Queens',5:'Staten Island'};
            const SIZE_COLORS: Record<string,string> = {Small:'#111e30',Medium:'#3a7d5e',Large:'#c9a227',XLarge:'#c4533a'};

            const _bldg   = (window as any).__halfaveBldg?.building;
            const myYear  = building.year_built || (_bldg?.yearBuilt ? Number(_bldg.yearBuilt) : 0);
            const myUnits = building.unit_count || (_bldg?.units ? Number(_bldg.units) : 0);
            const myBoro  = building.borough ? Number(building.borough) : 0;
            const myScore = riskScore?.health_score ?? 0;
            const mySize  = myUnits <= 10 ? 'Small' : myUnits <= 50 ? 'Medium' : myUnits <= 200 ? 'Large' : 'XLarge';

            // ── Chart 1: Line chart by size, 1900-2020
            const W = 760, H = 260, PL = 44, PR = 20, PT = 24, PB = 36;
            const CW = W-PL-PR, CH = H-PT-PB;
            const minY=35, maxY=100, minD=1900, maxD=2020;
            const decades = [1900,1910,1920,1930,1940,1950,1960,1970,1980,1990,2000,2010,2020];
            const xTicks  = [1900,1920,1940,1960,1980,2000,2020];
            const yTicks  = [40,50,60,70,80,90,100];
            const xS = (d:number) => ((d-minD)/(maxD-minD))*CW;
            const yS = (s:number) => CH - ((s-minY)/(maxY-minY))*CH;

            const sizeLines = ['Small','Medium','Large','XLarge'].map(size => {
              const pts: [number,number][] = decades
                .map(d => { const r = SIZE_DATA.find(x=>x.decade===d&&x.size_band===size); return r?[xS(d),yS(r.avg_score)] as [number,number]:null; })
                .filter((p): p is [number,number] => p!==null);
              return {size,pts,color:SIZE_COLORS[size]};
            });

            // ── Chart 2: Box & Whisker by borough
            const BW = 760, BH = 320, BPL = 80, BPR = 20, BPT = 20, BPB = 36;
            const BCW = BW-BPL-BPR, BCH = BH-BPT-BPB;
            const bMinY = 0, bMaxY = 100;
            const byS = (s:number) => BCH - ((s-bMinY)/(bMaxY-bMinY))*BCH;
            const bYTicks = [0,20,40,60,80,100];
            const boxW = Math.min(60, (BCW/5)*0.5);
            const boroXs = BOX_DATA.map((_,i) => BPL + (i+0.5)*(BCW/5));

            return (
              <>
                {/* Line chart: by size */}
                <div className="rp-section">
                  <div className="rp-section-title">Health Score by Building Size & Year Built</div>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'#9ca3af',marginBottom:12}}>
                    Average health score per decade, grouped by building size. Based on 34,169 NYC buildings from 1900 to 2020. The dot marks this building's actual score at its year built.
                  </div>
                  {/* Legend */}
                  <div style={{display:'flex',gap:20,flexWrap:'wrap',marginBottom:12}}>
                    {['Small','Medium','Large','XLarge'].map(s=>(
                      <div key={s} style={{display:'flex',alignItems:'center',gap:6,fontFamily:'var(--font-mono)',fontSize:10}}>
                        <div style={{width:16,height:2,background:SIZE_COLORS[s]}}/>
                        <span style={{color:'#6b7280'}}>{s}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{overflowX:'auto'}}>
                    <svg viewBox={`0 0 ${W} ${H}`} style={{width:'100%',minWidth:460,display:'block'}}>
                      {yTicks.map(t=>(
                        <g key={t}>
                          <line x1={PL} y1={PT+yS(t)} x2={PL+CW} y2={PT+yS(t)} stroke="rgba(17,30,48,0.06)" strokeWidth="1"/>
                          <text x={PL-6} y={PT+yS(t)+4} textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="monospace">{t}</text>
                        </g>
                      ))}
                      {xTicks.map(t=>(
                        <g key={t}>
                          <line x1={PL+xS(t)} y1={PT} x2={PL+xS(t)} y2={PT+CH} stroke="rgba(17,30,48,0.04)" strokeWidth="1"/>
                          <text x={PL+xS(t)} y={PT+CH+14} textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="monospace">{t}</text>
                        </g>
                      ))}
                      {sizeLines.map(({size,pts,color})=>pts.length>1&&(
                        <polyline key={size} points={pts.map(([x,y])=>`${PL+x},${PT+y}`).join(' ')}
                          fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
                      ))}
                      {/* This building — dot on its size line at its decade */}
                      {myYear>=1900&&myYear<=2020&&myScore>0&&(()=>{
                        const myDecade = Math.round(myYear/10)*10;
                        const snapDecade = Math.min(2020, Math.max(1900, myDecade));
                        const lineRow = SIZE_DATA.find(r=>r.decade===snapDecade&&r.size_band===mySize);
                        const dotY = lineRow ? PT+yS(lineRow.avg_score) : PT+yS(myScore);
                        const color = SIZE_COLORS[mySize];
                        return (
                          <>
                            <circle cx={PL+xS(myYear)} cy={dotY} r={6}
                              fill={color} stroke="#fff" strokeWidth="2.5"/>
                            <text x={PL+xS(myYear)+10} y={dotY+4} fontSize="9"
                              fill={color} fontFamily="monospace" fontWeight="700">★ you</text>
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                </div>

                {/* Box & Whisker: by borough */}
                <div className="rp-section">
                  <div className="rp-section-title">Health Score Distribution by Borough</div>
                  <div style={{fontFamily:'var(--font-mono)',fontSize:11,color:'#9ca3af',marginBottom:12}}>
                    Each box spans the 25th to 75th percentile of health scores for buildings in that borough. The horizontal line inside the box is the median, and the dot is the average. The star marks where this building's score falls within its borough.
                  </div>
                  <div style={{overflowX:'auto'}}>
                    <svg viewBox={`0 0 ${BW} ${BH}`} style={{width:'100%',minWidth:400,display:'block'}}>
                      {/* Grid */}
                      {bYTicks.map(t=>(
                        <g key={t}>
                          <line x1={BPL} y1={BPT+byS(t)} x2={BPL+BCW} y2={BPT+byS(t)} stroke="rgba(17,30,48,0.06)" strokeWidth="1"/>
                          <text x={BPL-8} y={BPT+byS(t)+4} textAnchor="end" fontSize="9" fill="#9ca3af" fontFamily="monospace">{t}</text>
                        </g>
                      ))}
                      {BOX_DATA.map((d,i)=>{
                        const cx = boroXs[i];
                        const color = BORO_COLORS[d.borough];
                        const bg    = BORO_BG[d.borough];
                        const yP25  = BPT+byS(d.p25);
                        const yMed  = BPT+byS(d.median);
                        const yP75  = BPT+byS(d.p75);
                        const isMe  = d.borough === myBoro;
                        return (
                          <g key={d.borough}>
                            {/* IQR box */}
                            <rect x={cx-boxW/2} y={yP75} width={boxW} height={yP25-yP75}
                              fill={bg} stroke={color} strokeWidth={isMe?2:1.5} rx="3"
                              opacity={isMe?1:0.85}/>
                            {/* Median line */}
                            <line x1={cx-boxW/2} y1={yMed} x2={cx+boxW/2} y2={yMed}
                              stroke={color} strokeWidth="2.5"/>
                            {/* Avg dot */}
                            <circle cx={cx} cy={BPT+byS(d.avg)} r={3} fill={color} opacity="0.7"/>
                            {/* Borough label */}
                            <text x={cx} y={BPT+BCH+16} textAnchor="middle" fontSize="9"
                              fill={isMe?color:'#9ca3af'} fontFamily="monospace"
                              fontWeight={isMe?'700':'400'}>{BORO_LABELS[d.borough]}</text>
                            {/* This building score dot */}
                            {isMe&&myScore>0&&(
                              <>
                                <circle cx={cx+boxW/2+8} cy={BPT+byS(myScore)} r={5}
                                  fill={color} stroke="#fff" strokeWidth="2"/>
                                <text x={cx+boxW/2+16} y={BPT+byS(myScore)+4} fontSize="9"
                                  fill={color} fontFamily="monospace" fontWeight="700">★ {myScore}</text>
                              </>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  {/* Legend */}
                  <div style={{display:'flex',gap:16,flexWrap:'wrap',marginTop:12,fontFamily:"'Inter', sans-serif",fontSize:11,color:'#9ca3af'}}>
                    <span>■ Box = 25th–75th percentile</span>
                    <span>— Thick line = median</span>
                    <span>• Dot = average</span>
                    <span>★ = this building</span>
                  </div>
                </div>
              </>
            );
          })()}

                    {/* ── NEIGHBORHOOD LEADERBOARD ── */}
          {(() => {
            const NEIGHBORHOODS: Record<string, { name: string; borough: string }> = {
              '11370': { name: 'East Elmhurst',       borough: 'Queens'        },
              '10314': { name: 'Mid-Island',           borough: 'Staten Island' },
              '10310': { name: 'West Brighton',        borough: 'Staten Island' },
              '11105': { name: 'Astoria',              borough: 'Queens'        },
              '11357': { name: 'Whitestone',           borough: 'Queens'        },
              '11103': { name: 'Astoria North',        borough: 'Queens'        },
              '11379': { name: 'Middle Village',       borough: 'Queens'        },
              '10306': { name: 'New Dorp',             borough: 'Staten Island' },
              '11694': { name: 'Rockaway Park',        borough: 'Queens'        },
              '11361': { name: 'Bayside',              borough: 'Queens'        },
              '11106': { name: 'Long Island City',     borough: 'Queens'        },
              '11101': { name: 'Long Island City',     borough: 'Queens'        },
              '11102': { name: 'Astoria South',        borough: 'Queens'        },
              '11356': { name: 'College Point',        borough: 'Queens'        },
              '11231': { name: 'Carroll Gardens',      borough: 'Brooklyn'      },
              '11385': { name: 'Ridgewood',            borough: 'Queens'        },
              '10075': { name: 'Upper East Side',      borough: 'Manhattan'     },
              '10028': { name: 'Upper East Side',      borough: 'Manhattan'     },
              '10305': { name: 'Rosebank',             borough: 'Staten Island' },
              '11367': { name: 'Kew Gardens Hills',   borough: 'Queens'        },
              '11225': { name: 'Crown Heights',        borough: 'Brooklyn'      },
              '10452': { name: 'Highbridge',           borough: 'Bronx'         },
              '10468': { name: 'Fordham',              borough: 'Bronx'         },
              '10457': { name: 'East Tremont',         borough: 'Bronx'         },
              '11207': { name: 'East New York',        borough: 'Brooklyn'      },
              '11213': { name: 'Crown Heights East',   borough: 'Brooklyn'      },
              '10467': { name: 'Norwood',              borough: 'Bronx'         },
              '11226': { name: 'Flatbush',             borough: 'Brooklyn'      },
              '10474': { name: 'Hunts Point',          borough: 'Bronx'         },
              '10466': { name: 'Wakefield',            borough: 'Bronx'         },
            };

            const BORO_COLORS: Record<string, string> = {
              Manhattan:    '#111e30',
              Bronx:        '#c4533a',
              Brooklyn:     '#4a7fb5',
              Queens:       '#c9a227',
              'Staten Island': '#7a8fa6',
            };

            const myZip = (window as any).__halfaveBldg?.building?.zipcode || building.zipcode;

            const worst10 = [
              { zip:'11225', avg:46.7, count:210  },
              { zip:'10452', avg:47.7, count:428  },
              { zip:'10468', avg:48.0, count:461  },
              { zip:'10457', avg:49.7, count:644  },
              { zip:'11207', avg:49.8, count:76   },
              { zip:'11213', avg:50.0, count:284  },
              { zip:'10467', avg:50.3, count:342  },
              { zip:'11226', avg:50.6, count:414  },
              { zip:'10474', avg:50.6, count:138  },
              { zip:'10466', avg:51.8, count:64   },
            ];

            const top10 = [
              { zip:'11370', avg:89.1, count:277  },
              { zip:'10314', avg:88.6, count:188  },
              { zip:'10310', avg:86.8, count:103  },
              { zip:'11105', avg:85.0, count:899  },
              { zip:'11357', avg:85.0, count:63   },
              { zip:'11103', avg:84.9, count:1319 },
              { zip:'11379', avg:84.8, count:170  },
              { zip:'10306', avg:84.4, count:83   },
              { zip:'11694', avg:83.8, count:52   },
              { zip:'11361', avg:83.7, count:61   },
            ];

            return (
              <div className="rp-section">
                <div className="rp-section-title">The Top 10 List</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#6b7280', marginBottom: 20 }}>
                  Ranked by average building health score across NYC rental properties (min. 50 buildings per ZIP code)
                </div>
                {(() => {
                  const LeaderboardList = ({ data, label }: { data: typeof top10; label: string }) => (
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#9ca3af', marginBottom: 10 }}>{label}</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {data.map((row, i) => {
                          const hood = NEIGHBORHOODS[row.zip];
                          if (!hood) return null;
                          const color = BORO_COLORS[hood.borough] ?? '#7a8fa6';
                          const isMe = myZip === row.zip;
                          const barPct = (row.avg / 100) * 100;
                          return (
                            <div key={row.zip} style={{
                              display: 'flex', alignItems: 'center', gap: 10,
                              padding: '8px 12px', borderRadius: 8,
                              background: isMe ? 'rgba(17,30,48,0.04)' : '#f9fafb',
                              border: isMe ? '1px solid rgba(17,30,48,0.15)' : '1px solid transparent',
                            }}>
                              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: '#9ca3af', width: 14, flexShrink: 0, textAlign: 'right' as const }}>{i + 1}</span>
                              <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: 'var(--navy)', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {hood.name}{isMe && <span style={{ color: 'var(--navy)', fontSize: 9, marginLeft: 4 }}>★ you</span>}
                                </div>
                                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: '#9ca3af' }}>{hood.borough} · {row.count.toLocaleString()} bldgs</div>
                              </div>
                              <div style={{ width: 60, height: 4, background: 'rgba(17,30,48,0.08)', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                                <div style={{ height: '100%', width: `${barPct}%`, background: color, borderRadius: 2 }} />
                              </div>
                              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color, flexShrink: 0, minWidth: 32, textAlign: 'right' as const }}>{row.avg}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                  return (
                    <div style={{ display: 'flex', gap: 24 }}>
                      <LeaderboardList data={top10} label="🏆 Healthiest" />
                      <LeaderboardList data={worst10} label="⚠️ Most At-Risk" />
                    </div>
                  );
                })()}
              </div>
            );
          })()}

                    {/* ── FOOTER ── */}
          <div style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid var(--navy-10)",
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: 10,
            color: "var(--slate)",
            lineHeight: 1.7,
          }}>
            <div style={{ marginBottom: 8 }}>
              Data sourced from NYC HPD, DOB, and ECB open datasets. Report generated by{" "}
              <a href="https://halfave.co" style={{ color: "var(--navy)", textDecoration: "underline" }}>Half Ave</a>{" "}
              using a combination of public records and proprietary models. This report is provided for informational
              purposes only and may not reflect real-time building conditions, status changes, or recent filings.
              While efforts are made to ensure accuracy, Half Ave makes no representations or warranties regarding
              completeness or reliability. Users should independently verify all information with the appropriate
              city agencies before making operational, financial, or legal decisions. Methodology and scoring approach
              available at:{" "}
              <a href="https://halfave.co/methodology" style={{ color: "var(--navy)", textDecoration: "underline" }}>halfave.co/methodology</a>.
            </div>
            {building.bbl && <div style={{ marginTop: 8, opacity: 0.6 }}>BBL: {building.bbl} · BIN: {building.bin}</div>}
          </div>
        </div>
      </div>
    </>
  );
}