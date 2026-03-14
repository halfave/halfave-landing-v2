import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase ────────────────────────────────────────────────────────────────
const supabase = createClient(
  "https://mjkkzniagexfooclqsjr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qa2t6bmlhZ2V4Zm9vY2xxc2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDc4OTUsImV4cCI6MjA4NjMyMzg5NX0.RuaeazBn_IFWfXOlQ0ZDDTPsnTApNGmE_WpPi0o52gQ"
).schema("analytics");

// ─── Types ───────────────────────────────────────────────────────────────────
import type { Building, RiskScore, BuildingFeatures, Violation, BoroughStat, HalfaveWindow, HalfaveBldgWindow } from "../types";

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

function fmt(n?: number | null, fallback = "–") {
  if (n == null) return fallback;
  return n.toLocaleString();
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
    --font-sans:  'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    --font-mono:  'DM Mono', 'Courier New', monospace;
    --radius: 12px;
    --radius-lg: 16px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--navy); font-family: var(--font-sans); }

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
    font-family: var(--font-sans);
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
    font-family: var(--font-sans);
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
    font-family: var(--font-sans);
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
    font-family: var(--font-sans);
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
    font-family: var(--font-sans);
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
    font-family: var(--font-sans);
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
    font-family: var(--font-sans);
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
    font-family: var(--font-sans);
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

  /* ── BOROUGH MAP ── */
  .rp-borough-wrap {
    display: grid;
    grid-template-columns: 240px 1fr;
    gap: 32px;
    align-items: start;
    padding: 24px;
  }
  .rp-borough-map-svg { width: 100%; height: auto; }
  .rp-borough-path {
    stroke: var(--cream);
    stroke-width: 1.5;
    stroke-linejoin: round;
    cursor: default;
    transition: opacity 0.15s;
  }
  .rp-borough-path:hover { opacity: 0.85; }
  .rp-borough-label {
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 600;
    fill: rgba(255,255,255,0.9);
    text-anchor: middle;
    pointer-events: none;
    letter-spacing: 0.04em;
  }
  .rp-borough-score-label {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 700;
    fill: rgba(255,255,255,0.95);
    text-anchor: middle;
    pointer-events: none;
  }
  .rp-borough-bars { display: flex; flex-direction: column; gap: 0; }
  .rp-borough-bar-row {
    display: grid;
    grid-template-columns: 90px 1fr 52px 60px;
    align-items: center;
    gap: 10px;
    padding: 11px 0;
    border-bottom: 1px solid var(--navy-10);
  }
  .rp-borough-bar-row:last-child { border-bottom: none; }
  .rp-borough-bar-name {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--navy);
  }
  .rp-borough-bar-track {
    height: 6px;
    background: var(--navy-10);
    border-radius: 3px;
    overflow: hidden;
  }
  .rp-borough-bar-fill {
    height: 100%;
    border-radius: 3px;
  }
  .rp-borough-bar-val {
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 700;
    text-align: right;
  }
  .rp-borough-bar-count {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--slate);
    text-align: right;
  }
  .rp-borough-legend {
    display: flex;
    gap: 16px;
    padding: 12px 24px;
    border-top: 1px solid var(--navy-10);
    flex-wrap: wrap;
  }
  .rp-borough-legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-mono);
    font-size: 11px;
    color: var(--slate);
  }
  .rp-borough-legend-dot {
    width: 10px; height: 10px; border-radius: 2px;
  }
  @media (max-width: 680px) {
    .rp-borough-wrap { grid-template-columns: 1fr; }
  }

  @media (max-width: 600px) {
    .rp-kpi-row { flex-wrap: wrap; }
    .rp-kpi { padding: 0 16px; margin-bottom: 16px; }
    .rp-vsummary { grid-template-columns: repeat(2, 1fr); }
    .rp-expand-inner { grid-template-columns: 1fr; }
    .rp-stats-grid { grid-template-columns: repeat(2, 1fr); }
  }
`;

// ─── Borough data ─────────────────────────────────────────────────────────────

function boroughScoreColor(score: number) {
  if (score >= 35) return "#c4533a";
  if (score >= 20) return "#c9a227";
  return "#3a7d5e";
}

// ─── Driver icon/color map ────────────────────────────────────────────────────

// ─── Accurate NYC Borough SVG Map ─────────────────────────────────────────────
const BOROUGH_PATHS: Record<string, { d: string; labelX: number; labelY: number }> = {
  Manhattan: {
    d: "M138,42 L142,38 L147,36 L151,38 L154,44 L156,52 L157,62 L156,74 L154,86 L152,96 L150,108 L149,118 L148,126 L146,132 L143,136 L140,138 L137,134 L135,126 L134,116 L133,104 L133,92 L133,80 L133,68 L134,56 L136,48 Z",
    labelX: 144, labelY: 90,
  },
  Bronx: {
    d: "M138,42 L136,48 L134,56 L133,66 L128,64 L122,62 L116,60 L110,60 L104,62 L100,66 L98,72 L98,80 L100,86 L104,90 L110,92 L116,92 L122,90 L128,88 L133,86 L134,86 L136,74 L137,62 L139,52 Z",
    labelX: 113, labelY: 76,
  },
  Queens: {
    d: "M150,108 L152,96 L154,86 L156,86 L162,86 L168,84 L174,82 L180,82 L186,84 L192,88 L196,94 L198,100 L198,108 L196,114 L192,120 L186,124 L180,126 L174,128 L168,130 L163,134 L158,138 L154,140 L150,140 L148,136 L149,126 L149,118 Z",
    labelX: 173, labelY: 108,
  },
  Brooklyn: {
    d: "M148,136 L150,140 L154,140 L158,138 L163,134 L163,142 L162,150 L160,158 L157,166 L154,172 L150,178 L146,182 L142,184 L138,184 L134,182 L130,178 L128,172 L127,166 L127,158 L128,150 L130,142 L133,136 L137,134 L140,138 L143,136 L146,132 Z",
    labelX: 144, labelY: 162,
  },
  "Staten Island": {
    d: "M88,200 L94,194 L100,190 L108,188 L116,188 L122,192 L126,198 L128,206 L128,214 L126,222 L122,228 L116,232 L108,234 L100,232 L94,226 L90,218 L88,210 Z",
    labelX: 108, labelY: 211,
  },
};

function BoroughMap({ stats, highlight }: { stats: BoroughStat[]; highlight?: string }) {
  const statMap = Object.fromEntries(stats.map((s) => [s.name, s]));
  return (
    <svg viewBox="0 0 300 320" className="rp-borough-map-svg" xmlns="http://www.w3.org/2000/svg">
      {Object.entries(BOROUGH_PATHS).map(([name, { d, labelX, labelY }]) => {
        const stat = statMap[name];
        const color = stat ? boroughScoreColor(stat.avg_score) : "#cbd5e1";
        const isHighlight = name === highlight;
        return (
          <g key={name}>
            <path d={d} className="rp-borough-path" fill={color}
              opacity={isHighlight ? 1 : 0.82} strokeWidth={isHighlight ? 2.5 : 1.5} />
            <text x={labelX} y={labelY - 7} className="rp-borough-label">
              {name === "Staten Island" ? "SI" : name}
            </text>
            {stat && (
              <text x={labelX} y={labelY + 6} className="rp-borough-score-label">
                {stat.avg_score.toFixed(1)}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}


// ─── Violation + Inspection Tabs ─────────────────────────────────────────────
type VTab = "HPD" | "DOB" | "ECB_OATH" | "Inspections" | "TCO";
const VTAB_LABELS: Record<VTab, string> = {
  HPD: "HPD", DOB: "DOB", ECB_OATH: "ECB / OATH", Inspections: "Inspections", TCO: "TCO",
};

function fmtDate(d: string | null | undefined): string {
  if (!d) return "—";
  try {
    if (/^\d{8}$/.test(d)) d = `${d.slice(0,4)}-${d.slice(4,6)}-${d.slice(6,8)}`;
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? d.slice(0,10) : dt.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return d.slice(0,10); }
}

interface UnifiedViolation {
  id: string;
  source: string;
  cls?: string;
  desc: string;
  date: string;
  balance?: number | null;
  link?: string;
}

function toUV(arr: any[], source: string, open: boolean): UnifiedViolation[] {
  if (!open) return [];
  return (arr || []).map((v: any) => ({
    id: v.id || "",
    source,
    cls: v.cls || "",
    desc: v.desc || v.description || "",
    date: v.date || v.issue_date || v.violation_date || "",
    balance: (v.penalty != null && Number(v.penalty) !== 0) ? Number(v.penalty) : null,
    link: v.link || undefined,
  }));
}

function sortByDate(a: UnifiedViolation, b: UnifiedViolation) {
  return (b.date || "").localeCompare(a.date || "");
}

interface InspectionItem {
  id: string;
  type: string;
  desc: string;
  date: string;
  status: string;
}

interface TcoItem {
  type: string;
  date: string;
  expiry: string;
  expired: boolean;
}

function ClsBadge({ cls, source }: { cls?: string; source: string }) {
  if (source === "HPD" && cls) {
    const bg = cls === "C" ? "#fde8e4" : cls === "B" ? "#fef3e2" : "#f0f4f8";
    const col = cls === "C" ? "#c4533a" : cls === "B" ? "#d97b3a" : "#7a8fa6";
    return <span style={{ display:"inline-block", padding:"1px 6px", borderRadius:4, fontSize:10, fontWeight:700, fontFamily:"var(--font-mono)", background:bg, color:col }}>Class {cls}</span>;
  }
  const labels: Record<string,string> = { DOB:"DOB", ECB:"ECB", OATH:"OATH", DSNY:"DSNY", DOHMH:"HLTH", NYPD:"NYPD" };
  const bgs: Record<string,string> = { DOB:"#eff6ff", ECB:"#fef3c7", OATH:"#fef3c7", DSNY:"#ecfdf5", DOHMH:"#fef3c7", NYPD:"#eff6ff" };
  const cols: Record<string,string> = { DOB:"#1d4ed8", ECB:"#b45309", OATH:"#b45309", DSNY:"#059669", DOHMH:"#b45309", NYPD:"#1d4ed8" };
  const lbl = labels[source] || source;
  return <span style={{ display:"inline-block", padding:"1px 6px", borderRadius:4, fontSize:10, fontWeight:700, fontFamily:"var(--font-mono)", background:bgs[source]||"#f0f4f8", color:cols[source]||"#7a8fa6" }}>{lbl}</span>;
}

function ViolRow({ v }: { v: UnifiedViolation }) {
  const [open, setOpen] = useState(false);
  return (
    <tr className="rp-vrow" onClick={() => setOpen(o => !o)} style={{ cursor:"pointer" }}>
      <td className="rp-vtd rp-vtd-badge"><ClsBadge cls={v.cls} source={v.source} /></td>
      <td className="rp-vtd rp-vtd-desc">
        <div style={{ fontWeight:500, fontSize:13, color:"var(--navy)", lineHeight:1.4 }}>
          {v.id && <span style={{ fontFamily:"var(--font-mono)", fontSize:10, color:"var(--slate)", marginRight:6 }}>#{v.id}</span>}
          {(v.desc || "No description").slice(0, open ? 9999 : 160)}{!open && (v.desc||"").length > 160 ? "…" : ""}
        </div>
        {v.balance && v.balance > 0 && (
          <div style={{ fontSize:11, color:"#b45309", fontWeight:600, marginTop:2, fontFamily:"var(--font-mono)" }}>
            Balance: ${v.balance.toLocaleString()}
          </div>
        )}
      </td>
      <td className="rp-vtd rp-vtd-date" style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--slate)", whiteSpace:"nowrap" }}>
        {fmtDate(v.date)}
      </td>
    </tr>
  );
}

function OpenViolationTabs(_props: { violations: Violation[]; elevators: any[]; boilers: any[]; co: any | null }) {
  const w = (window as any).__halfaveBldg || {};
  const vw = w.violations || {};

  // Build per-tab items from window raw data (richer than the Violation[] which lost source detail)
  const hpdItems: UnifiedViolation[] = [
    ...toUV(vw.hpd?.open || [], "HPD", true),
  ].sort(sortByDate);

  const dobItems: UnifiedViolation[] = [
    ...toUV(vw.dob?.open || [], "DOB", true),
  ].sort(sortByDate);

  const ecbOathItems: UnifiedViolation[] = [
    ...toUV(vw.ecb?.open || [], "ECB", true),
    ...toUV((vw.oath || []).filter((v: any) => {
      const d = (v.disposition || "").toUpperCase();
      return !d.includes("DISMISS") && d !== "PAID IN FULL" && d !== "PAID";
    }), "OATH", true),
    ...toUV((vw.sanitation || []).filter((v: any) => parseFloat(v.balance_due ?? "0") > 0), "DSNY", true),
    ...toUV((vw.dohmh || []).filter((v: any) => parseFloat(v.balance_due ?? "0") > 0), "DOHMH", true),
    ...toUV((vw.nypd || []).filter((v: any) => parseFloat(v.balance_due ?? "0") > 0), "NYPD", true),
  ].sort(sortByDate);

  // Inspections: elevators with overdue CAT1 or PVT, boilers not accepted
  const cutoff = new Date("2025-01-01");
  const inspItems: InspectionItem[] = [];
  const allElev = w.elevators || [];
  for (const d of allElev) {
    const id = (d.device_number || d.devicenumber || "—").toString();
    const catRaw = d.cat1_latest_report_filed || d.cat1_latest_report_filed_date || "";
    const pvtRaw = d.periodic_latest_inspection || d.periodic_latest_inspection_date || "";
    if (catRaw && new Date(catRaw) < cutoff) {
      inspItems.push({ id, type: "Elevator CAT1", desc: `Device #${id} — CAT1 inspection overdue`, date: catRaw, status: "Overdue" });
    }
    if (pvtRaw && new Date(pvtRaw) < cutoff) {
      inspItems.push({ id: id + "-pvt", type: "Elevator PVT", desc: `Device #${id} — Periodic inspection overdue`, date: pvtRaw, status: "Overdue" });
    }
  }
  const allBoilers = w.boilers || [];
  for (const d of allBoilers) {
    if ((d.report_status || "").toLowerCase() !== "accepted") {
      const id = (d.boiler_id || d.boilerid || "—").toString();
      inspItems.push({ id, type: "Boiler", desc: `Boiler #${id} — inspection not accepted`, date: d.inspection_date || "", status: d.report_status || "Not accepted" });
    }
  }
  inspItems.sort((a, b) => (b.date || "").localeCompare(a.date || ""));

  // TCO
  const tcoItems: TcoItem[] = [];
  const coData = w.co;
  if (coData) {
    const coType = (coData.c_of_o_filing_type || coData.certtype || coData.co_type || "").toLowerCase();
    const isFinal = coType.includes("final");
    if (!isFinal) {
      const issuedRaw = coData.c_of_o_issuance_date || coData.co_issue_date || coData.issue_date || "";
      let expiryStr = "";
      let expired = false;
      if (issuedRaw) {
        const expDate = new Date(issuedRaw);
        expDate.setMonth(expDate.getMonth() + 3);
        expiryStr = fmtDate(expDate.toISOString());
        expired = new Date() > expDate;
      }
      tcoItems.push({ type: coType || "Temporary CO", date: issuedRaw, expiry: expiryStr, expired });
    }
  }

  const counts: Record<VTab, number> = {
    HPD: hpdItems.length,
    DOB: dobItems.length,
    ECB_OATH: ecbOathItems.length,
    Inspections: inspItems.length,
    TCO: tcoItems.length,
  };

  const activeTabs = (["HPD","DOB","ECB_OATH","Inspections","TCO"] as VTab[]).filter(t => counts[t] > 0);
  const [tab, setTab] = useState<VTab>(activeTabs[0] ?? "HPD");
  const [page, setPage] = useState(25);

  const total = hpdItems.length + dobItems.length + ecbOathItems.length + inspItems.length + tcoItems.length;

  if (total === 0) {
    return (
      <div style={{ padding:"32px 20px", textAlign:"center", fontFamily:"var(--font-mono)", fontSize:13, color:"var(--slate)" }}>
        No open violations or outstanding items on record
      </div>
    );
  }

  return (
    <div>
      <div className="rp-tabs-nav">
        {activeTabs.map(t => (
          <button key={t} className={`rp-tab-btn ${tab === t ? "active" : ""}`}
            onClick={() => { setTab(t); setPage(25); }}>
            {VTAB_LABELS[t]}
            <span className="rp-tab-count">{counts[t]}</span>
          </button>
        ))}
      </div>

      <div className="rp-vtable-wrap">
        {tab === "HPD" && (
          <table className="rp-vtable">
            <thead><tr>
              <th style={{width:70}}>Class</th>
              <th>Description</th>
              <th style={{width:100}}>Issued</th>
            </tr></thead>
            <tbody>{hpdItems.slice(0,page).map((v,i) => <ViolRow key={i} v={v} />)}</tbody>
          </table>
        )}
        {tab === "DOB" && (
          <table className="rp-vtable">
            <thead><tr>
              <th style={{width:70}}>Source</th>
              <th>Description</th>
              <th style={{width:100}}>Issued</th>
            </tr></thead>
            <tbody>{dobItems.slice(0,page).map((v,i) => <ViolRow key={i} v={v} />)}</tbody>
          </table>
        )}
        {tab === "ECB_OATH" && (
          <table className="rp-vtable">
            <thead><tr>
              <th style={{width:70}}>Source</th>
              <th>Description</th>
              <th style={{width:100}}>Issued</th>
            </tr></thead>
            <tbody>{ecbOathItems.slice(0,page).map((v,i) => <ViolRow key={i} v={v} />)}</tbody>
          </table>
        )}
        {tab === "Inspections" && (
          <table className="rp-vtable">
            <thead><tr>
              <th style={{width:110}}>Type</th>
              <th>Description</th>
              <th style={{width:100}}>Last Inspection</th>
            </tr></thead>
            <tbody>
              {inspItems.slice(0,page).map((item,i) => (
                <tr key={i} className="rp-vrow">
                  <td className="rp-vtd rp-vtd-badge">
                    <span style={{ display:"inline-block", padding:"1px 6px", borderRadius:4, fontSize:10, fontWeight:700, fontFamily:"var(--font-mono)", background:"#fef2f2", color:"#c4533a" }}>
                      {item.type.includes("Elevator") ? "ELEV" : "BOILER"}
                    </span>
                  </td>
                  <td className="rp-vtd rp-vtd-desc">
                    <div style={{ fontWeight:500, fontSize:13, color:"var(--navy)" }}>{item.desc}</div>
                    <div style={{ fontSize:11, color:"#c4533a", fontWeight:600, fontFamily:"var(--font-mono)", marginTop:2 }}>{item.status}</div>
                  </td>
                  <td className="rp-vtd rp-vtd-date" style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--slate)", whiteSpace:"nowrap" }}>
                    {fmtDate(item.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === "TCO" && (
          <table className="rp-vtable">
            <thead><tr>
              <th style={{width:110}}>Type</th>
              <th>Status</th>
              <th style={{width:100}}>Issued</th>
            </tr></thead>
            <tbody>
              {tcoItems.map((item,i) => (
                <tr key={i} className="rp-vrow">
                  <td className="rp-vtd rp-vtd-badge">
                    <span style={{ display:"inline-block", padding:"1px 6px", borderRadius:4, fontSize:10, fontWeight:700, fontFamily:"var(--font-mono)", background: item.expired ? "#fef2f2" : "#fef3c7", color: item.expired ? "#c4533a" : "#b45309" }}>
                      {item.expired ? "EXPIRED" : "TEMP CO"}
                    </span>
                  </td>
                  <td className="rp-vtd rp-vtd-desc">
                    <div style={{ fontWeight:500, fontSize:13, color:"var(--navy)" }}>
                      {item.expired ? "TCO Expired" : "Temporary Certificate of Occupancy"}
                    </div>
                    {item.expiry && <div style={{ fontSize:11, color: item.expired ? "#c4533a" : "#b45309", fontWeight:600, fontFamily:"var(--font-mono)", marginTop:2 }}>
                      {item.expired ? "Expired" : "Expires"}: {item.expiry}
                    </div>}
                  </td>
                  <td className="rp-vtd rp-vtd-date" style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--slate)", whiteSpace:"nowrap" }}>
                    {fmtDate(item.date)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {(tab === "HPD" ? hpdItems : tab === "DOB" ? dobItems : tab === "ECB_OATH" ? ecbOathItems : tab === "Inspections" ? inspItems : tcoItems).length > page && (
          <button className="rp-load-more" onClick={() => setPage(p => p + 25)}>
            Show more ({(tab === "HPD" ? hpdItems : tab === "DOB" ? dobItems : tab === "ECB_OATH" ? ecbOathItems : tab === "Inspections" ? inspItems : tcoItems).length - page} remaining)
          </button>
        )}
      </div>
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
  const [boroughStats, setBoroughStats] = useState<BoroughStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let w = (window as HalfaveWindow).__halfaveBldg;

      // If arriving from email link (?bin=XXXX) with no window data, fetch from NYC Open Data
      if (!w?.bin) {
        const urlBin = new URLSearchParams(window.location.search).get("bin");
        if (!urlBin) throw new Error("No building data found. Please search for a building first.");

        const NYC_TOKEN = "hfh9po4tOCXZP5lkaDao0FLd1";
        const headers = { "X-App-Token": NYC_TOKEN };

        const [dobRes, hpdBldgRes, hpdViolRes, ecbRes, dobViolRes] = await Promise.all([
          fetch(`https://data.cityofnewyork.us/resource/w9ak-ipjd.json?bin=${urlBin}&$limit=1`, { headers }),
          fetch(`https://data.cityofnewyork.us/resource/kj4p-ruqc.json?bin=${urlBin}&$limit=1`, { headers }),
          fetch(`https://data.cityofnewyork.us/resource/wvxf-dwi5.json?bin=${urlBin}&$limit=500`, { headers }),
          fetch(`https://data.cityofnewyork.us/resource/6bgk-3dad.json?bin=${urlBin}&$limit=200`, { headers }).catch(() => ({ json: () => [] })),
          fetch(`https://data.cityofnewyork.us/resource/3h2n-5cm9.json?bin=${urlBin}&$limit=200`, { headers }),
        ]);

        const [dobData, hpdBldgRaw, hpdViolRaw, ecbRaw, dobViolRaw] = await Promise.all([
          dobRes.json(), hpdBldgRes.json(), hpdViolRes.json(),
          (ecbRes as any).json ? (ecbRes as any).json() : Promise.resolve([]),
          dobViolRes.json(),
        ]);

        const bldg = Array.isArray(dobData) && dobData.length > 0 ? dobData[0] : {};
        const hb = Array.isArray(hpdBldgRaw) && hpdBldgRaw.length > 0 ? hpdBldgRaw[0] : {};
        const boroNames: Record<string, string> = { "1": "Manhattan", "2": "Bronx", "3": "Brooklyn", "4": "Queens", "5": "Staten Island" };
        const boroName = boroNames[String(hb.boroid || bldg.boro)] || bldg.boro_nm || "";
        const address = [
          ((bldg.house_no || "") + " " + (bldg.street_name || "")).trim() || hb.buildingaddress || "",
          boroName, "NY",
        ].filter(Boolean).join(", ") || `BIN ${urlBin}`;

        // Quick risk score from HPD violations
        const hpd = Array.isArray(hpdViolRaw) ? hpdViolRaw : [];
        const openHpd = hpd.filter((v: any) => {
          const s = (v.currentstatus || v.violationstatus || "").toLowerCase();
          return !s.includes("close") && !s.includes("dismiss");
        });
        const classC = openHpd.filter((v: any) => (v.class || v.novtype || "").toUpperCase().startsWith("C"));
        const classB = openHpd.filter((v: any) => (v.class || v.novtype || "").toUpperCase().startsWith("B"));
        const ecbOpen = Array.isArray(ecbRaw) ? ecbRaw.filter((v: any) => {
          const cert = (v.certification_status || "").toUpperCase().trim();
          const bal = parseFloat(v.balance_due ?? "NaN");
          return !(cert !== "NO COMPLIANCE RECORDED" && !isNaN(bal) && bal === 0);
        }) : [];
        const dobOpen = Array.isArray(dobViolRaw) ? dobViolRaw.filter((v: any) => !((v.violation_category || "").includes("V*"))) : [];

        let pts = classC.length * 4 + classB.length * 2 + (openHpd.length - classC.length - classB.length) * 0.5
          + dobOpen.length * 2 + ecbOpen.length * 2;
        pts = Math.min(pts, 50);
        const riskScore = Math.max(Math.min(Math.round(pts), 100), 5);
        const pctMap = [5,10,20,30,40,50,60,70,80,90,100];
        const pctVal = [8,20,35,48,60,70,78,85,91,96,99];
        const percentile = pctVal[pctMap.findIndex(x => riskScore <= x) ?? 10];
        const riskBucket = riskScore >= 70 ? "Critical" : riskScore >= 55 ? "High Risk" : riskScore >= 35 ? "Elevated" : riskScore >= 20 ? "Watch" : "Healthy";

        // Synthesize violations for the tabs
        const toW = (arr: any[], isOpen: boolean) => arr.map((v: any) => ({
          id: v.violationid || v.number || v.ecb_violation_number || "",
          desc: v.novdescription || v.description || v.section_law_description1 || "",
          date: v.novissueddate || v.issue_date || "",
          cls: (v.class || v.novtype || "").toUpperCase().trim().charAt(0),
          isOpen,
          penalty: v.balance_due ? parseFloat(v.balance_due) : null,
          apt: v.apartment || "",
        }));

        (window as HalfaveWindow).__halfaveBldg = {
          bin: urlBin,
          address,
          bbl: "",
          stories: hb.legalstories || bldg.num_floors || "",
          units: hb.legalclassa || bldg.units_res || "",
          yearBuilt: hb.yearbuilt || "",
          zipcode: bldg.zipcode || "",
          borough: boroName,
          boroName,
          riskScore,
          percentile,
          riskBucket,
          openViolations: openHpd.length + dobOpen.length + ecbOpen.length,
          recent12m: openHpd.filter((v: any) => {
            try { return new Date(v.novissueddate) >= new Date(Date.now() - 365*24*60*60*1000); } catch { return false; }
          }).length,
          topDrivers: [
            classC.length > 0 ? `${classC.length} Class C HPD violation${classC.length > 1 ? "s" : ""}` : null,
            classB.length > 0 ? `${classB.length} Class B HPD violation${classB.length > 1 ? "s" : ""}` : null,
            dobOpen.length > 0 ? `${dobOpen.length} open DOB violation${dobOpen.length > 1 ? "s" : ""}` : null,
          ].filter(Boolean) as string[],
          violations: {
            hpd: { open: toW(openHpd, true), closed: toW(hpd.filter((v: any) => !openHpd.includes(v)), false) },
            dob: { open: toW(dobOpen, true), closed: [] },
            ecb: { open: toW(ecbOpen, true), closed: [] },
            oath: [], sanitation: [], dohmh: [], nypd: [],
          },
        };
        w = (window as HalfaveWindow).__halfaveBldg!;
      }

      // Hydrate building from window
      const resolvedBldg: Building = {
        id: `bin-${w.bin}`,
        bin: w.bin,
        address: w.address || "",
        borough: w.boroName || w.borough || "",
        borough_name: w.boroName || w.borough || undefined,
        bbl: w.bbl || null,
        stories: w.stories ? parseInt(String(w.stories)) : null,
        unit_count: w.units ? parseInt(String(w.units)) : null,
        year_built: w.yearBuilt && w.yearBuilt !== "—" ? parseInt(w.yearBuilt) : null,
        zipcode: w.zipcode || null,
        management_program: w.managementProgram || null,
        slug: undefined,
        risk_score: w.riskScore ?? null,
        risk_bucket: w.riskBucket ?? null,
        percentile: w.percentile ?? null,
        top_drivers: w.topDrivers ?? null,
      };
      setBuilding(resolvedBldg);

      // Hydrate risk score from window
      setRiskScore({
        risk_score: w.riskScore ?? 0,
        percentile: w.percentile ?? 0,
        risk_bucket: w.riskBucket ?? "Unknown",
        top_drivers: { drivers: (w.topDrivers || []) },
      });

      // Hydrate building features from window
      setFeatures({
        open_violations: w.openViolations ?? 0,
        recent_12m_violations: w.recent12m ?? 0,
        severity_points: 0,
        avg_open_age_days: 0,
        violation_density: 0,
        avg_resolution_days: 0,
        resolution_rate: 0,
        expired_tco: w.expiredTco ?? false,
        boiler_count: w.boilerCount ?? 0,
        boiler_avg_missed_years: 0,
        elevator_count: w.elevatorCount ?? 0,
        elevator_avg_missed_years: 0,
      });

      // Hydrate violations from window — flatten all sources into Violation[]
      const vw = (w.violations || {}) as NonNullable<HalfaveBldgWindow["violations"]>;
      const toViolations = (arr: any[], agencyLabel: string, isOpen: boolean): Violation[] => {
        const agencyEnum = (agencyLabel === "HPD" || agencyLabel === "DOB" || agencyLabel === "ECB")
          ? agencyLabel as Violation["agency"]
          : agencyLabel === "OATH" ? "ECB" as const
          : agencyLabel === "DSNY" || agencyLabel === "NYPD" ? "DOB" as const
          : "HPD" as const;
        return (arr || []).map((v: any) => ({
          id: v.id || "",
          agency: agencyEnum,
          source: agencyLabel,
          is_open: isOpen,
          violation_type: v.cls || v.type || agencyLabel,
          description: v.desc || v.description || "",
          issue_date: v.date || v.violation_date || v.issue_date || undefined,
          penalty_amount: v.penalty ?? undefined,
          disposition: v.status || undefined,
        }));
      };

      const allViolations: Violation[] = [
        ...toViolations(vw.hpd?.open || [], "HPD", true),
        ...toViolations(vw.hpd?.closed || [], "HPD", false),
        ...toViolations(vw.dob?.open || [], "DOB", true),
        ...toViolations(vw.dob?.closed || [], "DOB", false),
        ...toViolations(vw.ecb?.open || [], "ECB", true),
        ...toViolations(vw.ecb?.closed || [], "ECB", false),
        ...toViolations(
          (vw.oath || []).filter((v: any) => {
            const d = (v.disposition || "").toUpperCase();
            return !d.includes("DISMISS") && d !== "PAID IN FULL" && d !== "PAID";
          }), "OATH", true),
        ...toViolations(
          (vw.sanitation || []).filter((v: any) => parseFloat(v.balance_due ?? "0") > 0),
          "DSNY", true),
        ...toViolations(
          (vw.dohmh || []).filter((v: any) => parseFloat(v.balance_due ?? "0") > 0),
          "DOHMH", true),
        ...toViolations(
          (vw.nypd || []).filter((v: any) => parseFloat(v.balance_due ?? "0") > 0),
          "NYPD", true),
      ];
      setViolations(allViolations);

      // Borough stats: fetch from Supabase index (this is the comparison data, not the building itself)
      try {
        const db = (supabase as any).schema('analytics');
        const { data: boroughData } = await db
          .from("buildings")
          .select("borough, building_risk_scores!inner(risk_score)");
        if (boroughData) {
          const boroughMap: Record<string, { total: number; count: number }> = {};
          const boroughNameMap: Record<string, string> = {
            "1": "Manhattan", "2": "Bronx", "3": "Brooklyn", "4": "Queens", "5": "Staten Island",
          };
          for (const row of boroughData) {
            const bName = boroughNameMap[String(row.borough)];
            if (!bName) continue;
            const scores = (row as any).building_risk_scores;
            const score = Array.isArray(scores) ? scores[0]?.risk_score : scores?.risk_score;
            if (score == null) continue;
            if (!boroughMap[bName]) boroughMap[bName] = { total: 0, count: 0 };
            boroughMap[bName].total += score;
            boroughMap[bName].count += 1;
          }
          const stats: BoroughStat[] = Object.entries(boroughMap).map(([name, { total, count }]) => ({
            name, avg_score: Math.round((total / count) * 10) / 10, count,
          }));
          setBoroughStats(stats);
        }
      } catch (_) { /* borough stats optional */ }
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
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
  const boroughName = getBoroughName(building.borough);

  const openViolations = features?.open_violations ?? violations.filter((v) => v.is_open).length;
  const recent12m = features?.recent_12m_violations ?? 0;

  // Financial exposure
  const totalBalance = violations.reduce((s, v) => s + (v.balance_due ?? 0), 0);

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
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
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
                <div className="rp-score-label">Health Index</div>
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

          {/* ── OPEN VIOLATIONS (main tabbed view) ── */}
          <div className="rp-section">
            <div className="rp-section-title">
              Open Violations
              <span style={{ fontFamily:"var(--font-mono)", fontSize:11, color:"var(--slate)", fontWeight:400, textTransform:"none", letterSpacing:0 }}>
                open or balance due · click row to expand
              </span>
            </div>
            <OpenViolationTabs violations={violations} elevators={[]} boilers={[]} co={null} />
          </div>

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




          {/* ── RISK BY BOROUGH ── */}
          {boroughStats.length > 0 && (
            <div className="rp-section">
              <div className="rp-section-title">
                Risk by Borough
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--slate)", fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
                  Average risk score
                </span>
              </div>
              <div className="rp-card">
                <div className="rp-borough-wrap">
                  <BoroughMap stats={boroughStats} highlight={boroughName} />
                  <div className="rp-borough-bars">
                    {[...boroughStats]
                      .sort((a, b) => b.avg_score - a.avg_score)
                      .map((s) => (
                        <div className="rp-borough-bar-row" key={s.name}>
                          <span className="rp-borough-bar-name">{s.name}</span>
                          <div className="rp-borough-bar-track">
                            <div
                              className="rp-borough-bar-fill"
                              style={{
                                width: `${(s.avg_score / 100) * 100}%`,
                                background: boroughScoreColor(s.avg_score),
                              }}
                            />
                          </div>
                          <span
                            className="rp-borough-bar-val"
                            style={{ color: boroughScoreColor(s.avg_score) }}
                          >
                            {s.avg_score.toFixed(1)}
                          </span>
                          <span className="rp-borough-bar-count">
                            {s.count.toLocaleString()} bldgs
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="rp-borough-legend">
                  <div className="rp-borough-legend-item">
                    <div className="rp-borough-legend-dot" style={{ background: "#3a7d5e" }} />
                    &lt; 20 — Low
                  </div>
                  <div className="rp-borough-legend-item">
                    <div className="rp-borough-legend-dot" style={{ background: "#c9a227" }} />
                    20–35 — Moderate
                  </div>
                  <div className="rp-borough-legend-item">
                    <div className="rp-borough-legend-dot" style={{ background: "#c4533a" }} />
                    &gt; 35 — Elevated
                  </div>
                </div>
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
              © 2026 Half Ave Company LLC. All rights reserved.
            </div>
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
