import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase ────────────────────────────────────────────────────────────────
const supabase = createClient(
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
  slug?: string;
}

interface RiskScore {
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

function getBoroughName(b?: number | string | null) {
  if (!b) return "NYC";
  return BOROUGH_NAMES[String(b)] ?? "NYC";
}

function riskColor(percentile: number) {
  if (percentile >= 75) return "var(--risk-red)";
  if (percentile >= 50) return "var(--risk-amber)";
  return "var(--risk-green)";
}

function riskBg(percentile: number) {
  if (percentile >= 75) return "var(--risk-red-bg)";
  if (percentile >= 50) return "var(--risk-amber-bg)";
  return "var(--risk-green-bg)";
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

function fmt(n?: number | null, fallback = "–") {
  if (n == null) return fallback;
  return n.toLocaleString();
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
    --font-mono: 'DM Mono', 'Courier New', monospace;
    --radius: 12px;
    --radius-lg: 16px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--navy); font-family: var(--font-serif); }

  .rp-root { min-height: 100vh; background: var(--bg); }

  /* ── HERO ── */
  .rp-hero {
    background: var(--navy);
    padding: 48px 24px 0;
    position: relative;
    overflow: hidden;
  }
  .rp-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse 80% 60% at 50% 120%, rgba(196,83,58,0.18) 0%, transparent 70%);
    pointer-events: none;
  }
  .rp-hero-inner { max-width: 860px; margin: 0 auto; position: relative; }
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
    font-size: clamp(22px, 4vw, 34px);
    font-weight: 700;
    color: #fff;
    line-height: 1.15;
    margin-bottom: 6px;
  }
  .rp-hero-meta {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--slate);
    margin-bottom: 36px;
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .rp-hero-meta span::before { content: '· '; }
  .rp-hero-meta span:first-child::before { content: ''; }

  .rp-score-row {
    display: flex;
    align-items: flex-end;
    gap: 24px;
    padding-bottom: 36px;
    flex-wrap: wrap;
  }
  .rp-score-dial {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }
  .rp-score-circle {
    width: 96px;
    height: 96px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: 30px;
    font-weight: 700;
    border: 3px solid;
    position: relative;
  }
  .rp-score-label {
    font-family: var(--font-mono);
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--slate);
  }
  .rp-score-badge {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 4px;
    margin-top: 6px;
  }

  .rp-kpi-row {
    display: flex;
    gap: 0;
    border-left: 1px solid rgba(255,255,255,0.08);
  }
  .rp-kpi {
    padding: 0 28px;
    border-right: 1px solid rgba(255,255,255,0.08);
  }
  .rp-kpi-val {
    font-family: var(--font-mono);
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
  }
  .rp-kpi-lbl {
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--slate);
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  /* ── SCORE BAND ── */
  .rp-band {
    height: 6px;
    background: linear-gradient(to right, #3a7d5e 0%, #c9a227 50%, #c4533a 100%);
    position: relative;
    margin-top: 0;
  }
  .rp-band-marker {
    position: absolute;
    top: -4px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #fff;
    border: 3px solid var(--navy);
    transform: translateX(-50%);
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
  }

  /* ── BODY ── */
  .rp-body { max-width: 860px; margin: 0 auto; padding: 36px 24px 80px; }

  /* ── SECTION ── */
  .rp-section { margin-bottom: 40px; }
  .rp-section-title {
    font-family: var(--font-mono);
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
    font-family: var(--font-mono);
    font-size: 12px;
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
    font-family: var(--font-serif);
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
  .rp-alert.red { background: var(--risk-red-bg); border-color: rgba(196,83,58,0.25); color: var(--risk-red); }
  .rp-alert.amber { background: var(--risk-amber-bg); border-color: rgba(201,162,39,0.25); color: #9a7a1a; }

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

  @media (max-width: 600px) {
    .rp-kpi-row { flex-wrap: wrap; }
    .rp-kpi { padding: 0 16px; margin-bottom: 16px; }
    .rp-vsummary { grid-template-columns: repeat(2, 1fr); }
    .rp-expand-inner { grid-template-columns: 1fr; }
    .rp-stats-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

// ─── Driver icon/color map ────────────────────────────────────────────────────
function driverMeta(d: string): { icon: string; bg: string; color: string } {
  const dl = d.toLowerCase();
  if (dl.includes("boiler")) return { icon: "🔥", bg: "#fdf0ed", color: "#c4533a" };
  if (dl.includes("elevator") || dl.includes("lift")) return { icon: "🏗️", bg: "#fdf0ed", color: "#c4533a" };
  if (dl.includes("tco") || dl.includes("certificate")) return { icon: "📋", bg: "#fdf8ec", color: "#c9a227" };
  if (dl.includes("open violation") || dl.includes("count")) return { icon: "⚠️", bg: "#fdf0ed", color: "#c4533a" };
  if (dl.includes("recent") || dl.includes("12m") || dl.includes("trend")) return { icon: "📈", bg: "#fdf8ec", color: "#c9a227" };
  if (dl.includes("age") || dl.includes("days")) return { icon: "🕐", bg: "#fdf8ec", color: "#c9a227" };
  if (dl.includes("density")) return { icon: "📊", bg: "#fdf0ed", color: "#c4533a" };
  if (dl.includes("severity") || dl.includes("class c") || dl.includes("class a")) return { icon: "🚨", bg: "#fdf0ed", color: "#c4533a" };
  if (dl.includes("resolution") || dl.includes("resolve")) return { icon: "⏱️", bg: "#fdf8ec", color: "#c9a227" };
  if (dl.includes("penalty") || dl.includes("balance") || dl.includes("fine")) return { icon: "💰", bg: "#fdf8ec", color: "#c9a227" };
  return { icon: "⚡", bg: "#f0ede8", color: "#7a8fa6" };
}

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
        <td>
          <span className={`rp-status-dot ${v.is_open ? "open" : "closed"}`}>
            {v.is_open ? "Open" : "Closed"}
          </span>
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
          <td colSpan={5}>
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

// ─── Violation Tabs ────────────────────────────────────────────────────────────
type SortKey = "severity" | "issue_date" | "is_open" | "violation_type";

function ViolationTabs({ violations }: { violations: Violation[] }) {
  const [tab, setTab] = useState<"HPD" | "DOB" | "ECB">("HPD");
  const [sortKey, setSortKey] = useState<SortKey>("severity");
  const [sortAsc, setSortAsc] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(20);

  const byAgency = {
    HPD: violations.filter((v) => v.agency === "HPD"),
    DOB: violations.filter((v) => v.agency === "DOB"),
    ECB: violations.filter((v) => v.agency === "ECB"),
  };

  const current = byAgency[tab];
  const open = current.filter((v) => v.is_open);
  const closed = current.filter((v) => !v.is_open);

  const sorted = [...current].sort((a, b) => {
    let cmp = 0;
    if (sortKey === "severity") cmp = severityWeight(b.severity) - severityWeight(a.severity);
    else if (sortKey === "issue_date") cmp = (b.issue_date ?? "").localeCompare(a.issue_date ?? "");
    else if (sortKey === "is_open") cmp = (b.is_open ? 1 : 0) - (a.is_open ? 1 : 0);
    else if (sortKey === "violation_type") cmp = (a.violation_type ?? "").localeCompare(b.violation_type ?? "");
    return sortAsc ? -cmp : cmp;
  });

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
    setPage(20);
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const th = (label: string, key: SortKey) => (
    <th
      className={sortKey === key ? "sorted" : ""}
      onClick={() => toggleSort(key)}
    >
      {label}
      <span className="sort-arrow">{sortKey === key ? (sortAsc ? "↑" : "↓") : "↕"}</span>
    </th>
  );

  const tabs: ("HPD" | "DOB" | "ECB")[] = ["HPD", "DOB", "ECB"];

  return (
    <div>
      <div className="rp-tabs-nav">
        {tabs.map((t) => (
          <button
            key={t}
            className={`rp-tab-btn ${tab === t ? "active" : ""}`}
            onClick={() => { setTab(t); setPage(20); }}
          >
            {t}
            <span className="rp-tab-count">{byAgency[t].length}</span>
          </button>
        ))}
      </div>

      {current.length === 0 ? (
        <div style={{ padding: "32px 20px", textAlign: "center", fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--slate)" }}>
          No {tab} violations on record
        </div>
      ) : (
        <>
          <div className="rp-vsummary">
            <div className="rp-vsum-cell">
              <div className="rp-vsum-num" style={{ color: "var(--risk-red)" }}>{open.length}</div>
              <div className="rp-vsum-lbl">Open</div>
            </div>
            <div className="rp-vsum-cell">
              <div className="rp-vsum-num" style={{ color: "var(--risk-green)" }}>{closed.length}</div>
              <div className="rp-vsum-lbl">Closed</div>
            </div>
            <div className="rp-vsum-cell">
              <div className="rp-vsum-num">{current.filter((v) => v.severity === "C" || v.severity === "CLASS - 1").length}</div>
              <div className="rp-vsum-lbl">High Severity</div>
            </div>
          </div>
          <div className="rp-vtable-wrap">
            <table className="rp-vtable">
              <thead>
                <tr>
                  {th("Severity", "severity")}
                  {th("Type / Description", "violation_type")}
                  {th("Status", "is_open")}
                  {th("Issued", "issue_date")}
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.slice(0, page).map((v) => (
                  <ViolationRow
                    key={v.id}
                    v={v}
                    expanded={expanded.has(v.id)}
                    onToggle={() => toggleExpand(v.id)}
                  />
                ))}
              </tbody>
            </table>
            {sorted.length > page && (
              <button className="rp-load-more" onClick={() => setPage((p) => p + 20)}>
                Show more ({sorted.length - page} remaining)
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Peer Bar ─────────────────────────────────────────────────────────────────
function PeerBar({
  label,
  value,
  max,
  avg,
  format,
  warningThreshold,
}: {
  label: string;
  value: number;
  max: number;
  avg: number;
  format?: (n: number) => string;
  warningThreshold?: number;
}) {
  const pct = Math.min((value / max) * 100, 100);
  const avgPct = Math.min((avg / max) * 100, 100);
  const isWarn = warningThreshold != null && value > warningThreshold;
  const fillColor = isWarn ? "var(--risk-red)" : "var(--navy)";
  const fmtFn = format ?? ((n: number) => String(Math.round(n)));

  return (
    <div className="rp-peer-row">
      <div className="rp-peer-label">
        <span className="rp-peer-name">{label}</span>
        <span className="rp-peer-val" style={{ color: isWarn ? "var(--risk-red)" : undefined }}>
          {fmtFn(value)}
        </span>
      </div>
      <div className="rp-peer-track">
        <div
          className="rp-peer-fill"
          style={{ width: `${pct}%`, background: fillColor }}
        />
        <div className="rp-peer-avg" style={{ left: `${avgPct}%` }} title={`NYC avg: ${fmtFn(avg)}`} />
      </div>
    </div>
  );
}

// ─── Main ReportPage ──────────────────────────────────────────────────────────
export default function ReportPage() {
  const [building, setBuilding] = useState<Building | null>(null);
  const [riskScore, setRiskScore] = useState<RiskScore | null>(null);
  const [features, setFeatures] = useState<BuildingFeatures | null>(null);
  const [violations, setViolations] = useState<Violation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Get BIN from URL params or window global
      const params = new URLSearchParams(window.location.search);
      const bin = params.get("bin") || (window as any).__halfaveBldg?.bin;
      if (!bin) throw new Error("No building BIN specified.");

      // Fetch building
      const { data: bldgs, error: bErr } = await supabase
        .from("buildings")
        .select("*")
        .eq("bin", bin)
        .limit(1);
      if (bErr) throw bErr;
      if (!bldgs?.length) throw new Error(`No building found for BIN ${bin}`);
      const bldg = bldgs[0];
      setBuilding(bldg);

      const buildingId = bldg.id;

      // Parallel: risk score + features + violations
      const [rsRes, ftRes, vRes] = await Promise.all([
        supabase
          .from("building_risk_scores")
          .select("*")
          .eq("building_id", buildingId)
          .single(),
        supabase
          .from("building_features")
          .select("*")
          .eq("building_id", buildingId)
          .single(),
        supabase
          .from("violations")
          .select("*")
          .eq("building_id", buildingId)
          .order("issue_date", { ascending: false }),
      ]);

      if (rsRes.data) setRiskScore(rsRes.data);
      if (ftRes.data) setFeatures(ftRes.data);
      if (vRes.data) setViolations(vRes.data);
    } catch (e: any) {
      setError(e?.message || "Failed to load report.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
  const score = rs?.risk_score ?? 0;
  const bucket = rs?.risk_bucket ?? "Unknown";
  const drivers = rs?.top_drivers?.drivers ?? [];
  const boroughName = getBoroughName(building.borough);

  const openViolations = features?.open_violations ?? violations.filter((v) => v.is_open).length;
  const recent12m = features?.recent_12m_violations ?? 0;

  // Financial exposure
  const totalBalance = violations.reduce((s, v) => s + (v.balance_due ?? 0), 0);
  const totalPenalty = violations.reduce((s, v) => s + (v.penalty_amount ?? 0), 0);

  const scoreColor = riskColor(pct);
  const scoreBg = riskBg(pct);
  const bandPct = (score / 100) * 100;

  // Peer comparison data (NYC averages rough estimates)
  const peerRows = features
    ? [
        {
          label: "Open Violations",
          value: features.open_violations,
          max: 120,
          avg: 8,
          warningThreshold: 15,
        },
        {
          label: "Avg Days Open",
          value: Math.round(features.avg_open_age_days),
          max: 1000,
          avg: 180,
          warningThreshold: 365,
          format: (n: number) => `${n}d`,
        },
        {
          label: "Violation Density",
          value: features.violation_density,
          max: 3,
          avg: 0.3,
          warningThreshold: 0.8,
          format: (n: number) => n.toFixed(2),
        },
        {
          label: "Resolution Rate",
          value: features.resolution_rate,
          max: 1,
          avg: 0.65,
          format: (n: number) => `${Math.round(n * 100)}%`,
        },
      ]
    : [];

  return (
    <>
      <style>{CSS}</style>
      <div className="rp-root">
        {/* ── HERO ── */}
        <div className="rp-hero">
          <div className="rp-hero-inner">
            <div className="rp-hero-eyebrow">NYC Building Risk Report · Half Ave</div>
            <div className="rp-hero-address">{building.address}</div>
            <div className="rp-hero-meta">
              <span>{boroughName}</span>
              {building.zipcode && <span>{building.zipcode}</span>}
              {building.stories && <span>{building.stories} stories</span>}
              {building.unit_count && <span>{building.unit_count} units</span>}
              {building.year_built && <span>Built {building.year_built}</span>}
              {building.bin && <span>BIN {building.bin}</span>}
            </div>

            <div className="rp-score-row">
              <div className="rp-score-dial">
                <div
                  className="rp-score-circle"
                  style={{ color: scoreColor, borderColor: scoreColor, background: scoreBg }}
                >
                  {score}
                </div>
                <div className="rp-score-label">Risk Score</div>
                <div
                  className="rp-score-badge"
                  style={{ background: scoreColor + "22", color: scoreColor }}
                >
                  {bucket}
                </div>
              </div>

              <div className="rp-kpi-row">
                <div className="rp-kpi">
                  <div className="rp-kpi-val">{fmt(openViolations)}</div>
                  <div className="rp-kpi-lbl">Open Violations</div>
                </div>
                <div className="rp-kpi">
                  <div className="rp-kpi-val">{fmt(recent12m)}</div>
                  <div className="rp-kpi-lbl">Last 12 Months</div>
                </div>
                <div className="rp-kpi">
                  <div className="rp-kpi-val">{pct >= 99 ? "99.9" : pct.toFixed(0)}th</div>
                  <div className="rp-kpi-lbl">Percentile</div>
                </div>
                {totalBalance > 0 && (
                  <div className="rp-kpi">
                    <div className="rp-kpi-val" style={{ color: "var(--risk-red)" }}>
                      {fmtCurrency(totalBalance)}
                    </div>
                    <div className="rp-kpi-lbl">Balance Due</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Score band */}
          <div style={{ maxWidth: 860, margin: "0 auto" }}>
            <div className="rp-band">
              <div className="rp-band-marker" style={{ left: `${bandPct}%` }} />
            </div>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="rp-body">

          {/* ── ALERTS ── */}
          {(features?.expired_tco || (features?.boiler_avg_missed_years ?? 0) > 1 || (features?.elevator_avg_missed_years ?? 0) > 1) && (
            <div className="rp-section">
              <div className="rp-section-title">Active Alerts</div>
              {features?.expired_tco && (
                <div className="rp-alert red">
                  <div className="rp-alert-icon">📋</div>
                  <div className="rp-alert-body">
                    <div className="rp-alert-title">Expired or Missing TCO</div>
                    <p>This building's Temporary Certificate of Occupancy has expired. Residents may be occupying a building without valid authorization.</p>
                  </div>
                </div>
              )}
              {(features?.boiler_avg_missed_years ?? 0) > 1 && (
                <div className="rp-alert red">
                  <div className="rp-alert-icon">🔥</div>
                  <div className="rp-alert-body">
                    <div className="rp-alert-title">Boiler Inspection Overdue</div>
                    <p>
                      {features!.boiler_count} boiler{features!.boiler_count !== 1 ? "s" : ""} averaging{" "}
                      {features!.boiler_avg_missed_years.toFixed(1)} missed inspection year{features!.boiler_avg_missed_years !== 1 ? "s" : ""}.
                    </p>
                  </div>
                </div>
              )}
              {(features?.elevator_avg_missed_years ?? 0) > 1 && (
                <div className="rp-alert amber">
                  <div className="rp-alert-icon">🏗️</div>
                  <div className="rp-alert-body">
                    <div className="rp-alert-title">Elevator Inspection Overdue</div>
                    <p>
                      {features!.elevator_count} elevator{features!.elevator_count !== 1 ? "s" : ""} averaging{" "}
                      {features!.elevator_avg_missed_years.toFixed(1)} missed inspection year{features!.elevator_avg_missed_years !== 1 ? "s" : ""}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── RISK DRIVERS ── */}
          {drivers.length > 0 && (
            <div className="rp-section">
              <div className="rp-section-title">Top Risk Drivers</div>
              <div className="rp-card">
                <div className="rp-drivers">
                  {drivers.map((d, i) => {
                    const meta = driverMeta(d);
                    return (
                      <div className="rp-driver" key={i}>
                        <span className="rp-driver-idx">{i + 1}</span>
                        <div
                          className="rp-driver-icon"
                          style={{ background: meta.bg }}
                        >
                          {meta.icon}
                        </div>
                        <span className="rp-driver-text">{d}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── BUILDING METRICS ── */}
          {features && (
            <div className="rp-section">
              <div className="rp-section-title">Building Metrics</div>
              <div className="rp-stats-grid">
                <div className="rp-stat">
                  <div className={`rp-stat-val ${features.open_violations > 20 ? "rp-stat-warn" : features.open_violations > 10 ? "rp-stat-caution" : "rp-stat-ok"}`}>
                    {fmt(features.open_violations)}
                  </div>
                  <div className="rp-stat-lbl">Open violations</div>
                </div>
                <div className="rp-stat">
                  <div className={`rp-stat-val ${features.recent_12m_violations > 30 ? "rp-stat-warn" : features.recent_12m_violations > 15 ? "rp-stat-caution" : ""}`}>
                    {fmt(features.recent_12m_violations)}
                  </div>
                  <div className="rp-stat-lbl">New last 12 months</div>
                </div>
                <div className="rp-stat">
                  <div className={`rp-stat-val ${features.avg_open_age_days > 500 ? "rp-stat-warn" : features.avg_open_age_days > 200 ? "rp-stat-caution" : ""}`}>
                    {Math.round(features.avg_open_age_days)}d
                  </div>
                  <div className="rp-stat-lbl">Avg days open</div>
                </div>
                <div className="rp-stat">
                  <div className={`rp-stat-val ${features.violation_density > 1 ? "rp-stat-warn" : features.violation_density > 0.5 ? "rp-stat-caution" : "rp-stat-ok"}`}>
                    {features.violation_density.toFixed(2)}
                  </div>
                  <div className="rp-stat-lbl">Violations per unit</div>
                </div>
                <div className="rp-stat">
                  <div className={`rp-stat-val ${features.resolution_rate < 0.5 ? "rp-stat-warn" : features.resolution_rate < 0.7 ? "rp-stat-caution" : "rp-stat-ok"}`}>
                    {Math.round(features.resolution_rate * 100)}%
                  </div>
                  <div className="rp-stat-lbl">Resolution rate</div>
                </div>
                <div className="rp-stat">
                  <div className={`rp-stat-val ${features.avg_resolution_days > 365 ? "rp-stat-warn" : features.avg_resolution_days > 180 ? "rp-stat-caution" : ""}`}>
                    {Math.round(features.avg_resolution_days)}d
                  </div>
                  <div className="rp-stat-lbl">Avg days to resolve</div>
                </div>
                <div className="rp-stat">
                  <div className={`rp-stat-val ${features.severity_points > 200 ? "rp-stat-warn" : features.severity_points > 100 ? "rp-stat-caution" : ""}`}>
                    {fmt(features.severity_points)}
                  </div>
                  <div className="rp-stat-lbl">Severity score</div>
                </div>
                {totalBalance > 0 && (
                  <div className="rp-stat">
                    <div className="rp-stat-val rp-stat-warn">{fmtCurrency(totalBalance)}</div>
                    <div className="rp-stat-lbl">Balance due</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── PEER COMPARISON ── */}
          {peerRows.length > 0 && (
            <div className="rp-section">
              <div className="rp-section-title">Peer Comparison vs NYC Average</div>
              <div className="rp-card">
                {peerRows.map((row) => (
                  <PeerBar key={row.label} {...row} />
                ))}
              </div>
              <div style={{ marginTop: 8, fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--slate)" }}>
                Gray marker = NYC building average. Bar = this building.
              </div>
            </div>
          )}

          {/* ── VIOLATIONS ── */}
          {violations.length > 0 && (
            <div className="rp-section">
              <div className="rp-section-title">
                All Violations
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--slate)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                  {violations.length} total · click row to expand
                </span>
              </div>
              <ViolationTabs violations={violations} />
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
