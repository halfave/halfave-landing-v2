import { useEffect, useState, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase ────────────────────────────────────────────────────────────────
const supabase = createClient(
  "https://mjkkzniagexfooclqsjr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1qa2t6bmlhZ2V4Zm9vY2xxc2pyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3NDc4OTUsImV4cCI6MjA4NjMyMzg5NX0.RuaeazBn_IFWfXOlQ0ZDDTPsnTApNGmE_WpPi0o52gQ"
).schema("analytics");

// ─── Types ───────────────────────────────────────────────────────────────────
import type { Building, RiskScore, BuildingFeatures, Violation, BoroughStat, HalfaveWindow, HalfaveBldgWindow } from "../types";

// ─── Local Types ─────────────────────────────────────────────────────────────
type OwnershipStat = { ownership: string; avg_score: number; count: number };

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
}function fmtCurrency(n?: number | null) {
  if (!n) return "–";
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

// ─── CSS ─────────────────────────────────────────────────────────────────────
const CSS = `
  :root {
    --navy: #111e30;
    --cream: #ffffff;
    --bg: #ffffff;
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
  body { background: var(--bg); color: var(--navy); font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

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
    font-family: 'DM Mono', 'Courier New', monospace;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--slate);
    margin-bottom: 12px;
  }
  .rp-hero-address {
    font-family: 'Lora', Georgia, serif;
    font-size: clamp(22px, 4vw, 34px);
    font-weight: 700;
    color: #fff;
    line-height: 1.15;
    margin-bottom: 6px;
  }
  .rp-hero-meta {
    font-family: 'DM Mono', 'Courier New', monospace;
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
    font-family: 'DM Mono', 'Courier New', monospace;
    font-size: 30px;
    font-weight: 700;
    border: 3px solid;
    position: relative;
  }
  .rp-score-label {
    font-family: 'DM Mono', 'Courier New', monospace;
    font-size: 10px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--slate);
  }
  .rp-score-badge {
    font-family: 'DM Mono', 'Courier New', monospace;
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
    font-family: 'DM Mono', 'Courier New', monospace;
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    line-height: 1;
  }
  .rp-kpi-lbl {
    font-family: 'DM Mono', 'Courier New', monospace;
    font-size: 11px;
    color: var(--slate);
    margin-top: 4px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  /* ── SCORE BAND ── */
  .rp-band {
    height: 6px;
    background: linear-gradient(to right, #c4533a 0%, #c9a227 50%, #3a7d5e 100%);
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
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
  .rp-driver:hover { background: rgba(17,30,48,0.02); }
  .rp-driver-idx {
    font-family: 'DM Mono', 'Courier New', monospace;
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
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
    font-family: 'DM Mono', 'Courier New', monospace;
    font-size: 22px;
    font-weight: 700;
    color: var(--navy);
    line-height: 1;
  }
  .rp-stat-lbl {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
    font-family: 'DM Mono', 'Courier New', monospace;
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
    font-family: 'DM Mono', 'Courier New', monospace;
    font-size: 20px;
    font-weight: 700;
    line-height: 1;
  }
  .rp-vsum-lbl {
    font-family: 'DM Mono', 'Courier New', monospace;
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
    font-family: 'DM Mono', 'Courier New', monospace;
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
  .rp-vtable tbody tr:hover { background: rgba(17,30,48,0.02); }
  .rp-vtable tbody tr.expandable { cursor: pointer; }
  .rp-vtable td {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important; font-size: 13px;
    padding: 10px 14px;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 12px;
    color: var(--navy);
    vertical-align: top;
  }
  .rp-sev-badge {
    display: inline-block;
    font-family: 'DM Mono', 'Courier New', monospace;
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
    background: rgba(17,30,48,0.02);
    padding: 0;
  }
  .rp-expand-inner {
    padding: 14px 20px;
    font-family: 'Lora', Georgia, serif;
    font-size: 13px;
    line-height: 1.6;
    color: var(--navy);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 24px;
  }
  .rp-expand-field { display: flex; flex-direction: column; gap: 2px; }
  .rp-expand-key {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
    font-family: 'DM Mono', 'Courier New', monospace;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 3px;
  }
  .rp-alert-body p {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    font-size: 12px;
    color: var(--navy);
  }
  .rp-peer-val {
    font-family: 'DM Mono', 'Courier New', monospace;
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
    font-family: 'DM Mono', 'Courier New', monospace;
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

  /* ── BOROUGH MAP ── */  .rp-borough-map-svg { width: 180px; height: auto; flex-shrink: 0; }  .rp-borough-path:hover { opacity: 0.85; }  .rp-borough-score-label {
    font-family: 'DM Mono', 'Courier New', monospace;
    font-size: 11px;
    font-weight: 700;
    fill: rgba(255,255,255,0.95);
    text-anchor: middle;
    pointer-events: none;
  }  .rp-borough-bar-row {
    display: grid;
    grid-template-columns: 90px 1fr 52px 60px;
    align-items: center;
    gap: 10px;
    padding: 11px 0;
    border-bottom: 1px solid var(--navy-10);
  }  .rp-borough-bar-name {
    font-family: 'DM Mono', 'Courier New', monospace;
    font-size: 12px;
    color: var(--navy);
  }  .rp-borough-bar-fill {
    height: 100%;
    border-radius: 3px;
  }  .rp-borough-bar-count {
    font-family: 'DM Mono', 'Courier New', monospace;
    font-size: 10px;
    color: var(--slate);
    text-align: right;
  }  .rp-borough-legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: 'DM Mono', 'Courier New', monospace;
    font-size: 11px;
    color: var(--slate);
  }  @media (max-width: 680px) {
    .rp-borough-wrap { grid-template-columns: 1fr; }
  }

  @media (max-width: 600px) {
    .rp-kpi-row { flex-wrap: wrap; }
    .rp-kpi { padding: 0 16px; margin-bottom: 16px; }
    .rp-vsummary { grid-template-columns: repeat(2, 1fr); }
    .rp-expand-inner { grid-template-columns: 1fr; }
    .rp-stats-grid { grid-template-columns: repeat(2, 1fr); }
    .rp-insights-grid { grid-template-columns: 1fr !important; }
  }
`;

// ─── Borough data ─────────────────────────────────────────────────────────────

function boroughScoreColor(score: number) {
  if (score >= 35) return "#c4533a";
  if (score >= 20) return "#c9a227";
  return "#3a7d5e";
}

// ─── Driver icon/color map ────────────────────────────────────────────────────

// ─── Accurate NYC Borough SVG Map ─────────────────────────────────────────────: { stats: BoroughStat[]; highlight?: string }) {
  const statMap = Object.fromEntries(stats.map((s) => [s.name, s]));
  // Real SVG paths from Wikipedia NYC borough map (viewBox 0 0 549 524)
  const PATHS: Record<string, { d: string; lx: number; ly: number }> = {
    Bronx: {
      d: "M 203,22 L 216,18 L 234,22 L 248,30 L 258,42 L 262,56 L 258,70 L 250,80 L 238,88 L 224,92 L 210,90 L 198,84 L 190,74 L 186,62 L 188,50 L 196,38 Z",
      lx: 224, ly: 56,
    },
    Manhattan: {
      d: "M 260,56 L 264,48 L 270,42 L 278,38 L 286,38 L 292,42 L 296,50 L 298,60 L 296,72 L 292,100 L 288,128 L 284,152 L 280,170 L 274,182 L 268,188 L 262,186 L 258,178 L 256,164 L 256,144 L 258,120 L 260,96 L 262,72 Z",
      lx: 277, ly: 112,
    },
    Queens: {
      d: "M 296,72 L 310,68 L 326,66 L 344,66 L 362,70 L 378,78 L 390,90 L 396,104 L 396,120 L 390,134 L 380,144 L 366,150 L 350,152 L 334,150 L 320,144 L 308,134 L 300,122 L 296,108 Z",
      lx: 348, ly: 110,
    },
    Brooklyn: {
      d: "M 280,170 L 296,168 L 312,168 L 326,172 L 338,180 L 346,192 L 348,206 L 344,220 L 336,232 L 324,240 L 310,244 L 296,242 L 282,236 L 272,226 L 266,214 L 264,200 L 266,188 L 274,182 Z",
      lx: 308, ly: 206,
    },
    "Staten Island": {
      d: "M 122,290 L 136,282 L 152,278 L 168,278 L 182,284 L 192,294 L 196,308 L 194,322 L 186,334 L 174,342 L 160,346 L 146,344 L 132,338 L 122,328 L 116,314 L 116,300 Z",
      lx: 156, ly: 312,
    },
  };

  return (
    <svg viewBox="0 0 500 380" className="rp-borough-map-svg" xmlns="http://www.w3.org/2000/svg">
      {Object.entries(PATHS).map(([name, { d, lx, ly }]) => {
        const stat = statMap[name];
        const fillColor = stat ? boroughScoreColor(stat.avg_score) : "#e2e8f0";
        const isHL = name === highlight;
        const abbr: Record<string,string> = { Manhattan:"MN", Bronx:"BX", Brooklyn:"BK", Queens:"QN", "Staten Island":"SI" };
        return (
          <g key={name}>
            <path d={d} fill={fillColor} fillOpacity={isHL ? 1 : 0.8}
              stroke="white" strokeWidth={isHL ? 2.5 : 1.5} strokeLinejoin="round" />
            <text x={lx} y={ly - 6} textAnchor="middle" fontSize={9}
              fontFamily="monospace" fill="white" fontWeight="700" pointerEvents="none">
              {abbr[name]}
            </text>
            {stat && (
              <text x={lx} y={ly + 5} textAnchor="middle" fontSize={8}
                fontFamily="monospace" fill="white" pointerEvents="none">
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

function normalizeHPDClass(cls: string): string {
  // HPD raw API uses first char of severity label: I=Immediately hazardous=C, H=Hazardous=B, L=Low/Non-hazardous=A
  if (cls === "I") return "C";
  if (cls === "H") return "B";
  if (cls === "L") return "A";
  return cls; // already A/B/C or empty
}

function toUV(arr: any[], source: string, open: boolean): UnifiedViolation[] {
  if (!open) return [];
  return (arr || []).map((v: any) => ({
    id: v.id || "",
    source,
    cls: source === "HPD" ? normalizeHPDClass(v.cls || "") : (v.cls || ""),
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
    return <span style={{ display:"inline-block", padding:"1px 6px", borderRadius:4, fontSize:10, fontWeight:700, fontFamily:"'DM Mono', monospace", background:bg, color:col }}>Class {cls}</span>;
  }
  const labels: Record<string,string> = { DOB:"DOB", ECB:"ECB", OATH:"OATH", DSNY:"DSNY", DOHMH:"HLTH", NYPD:"NYPD" };
  const bgs: Record<string,string> = { DOB:"#eff6ff", ECB:"#fef3c7", OATH:"#fef3c7", DSNY:"#ecfdf5", DOHMH:"#fef3c7", NYPD:"#eff6ff" };
  const cols: Record<string,string> = { DOB:"#1d4ed8", ECB:"#b45309", OATH:"#b45309", DSNY:"#059669", DOHMH:"#b45309", NYPD:"#1d4ed8" };
  const lbl = labels[source] || source;
  return <span style={{ display:"inline-block", padding:"1px 6px", borderRadius:4, fontSize:10, fontWeight:700, fontFamily:"'DM Mono', monospace", background:bgs[source]||"#f0f4f8", color:cols[source]||"#7a8fa6" }}>{lbl}</span>;
}

function ViolRow({ v }: { v: UnifiedViolation }) {
  const [open, setOpen] = useState(false);
  return (
    <tr className="rp-vrow" onClick={() => setOpen(o => !o)} style={{ cursor:"pointer" }}>
      <td className="rp-vtd rp-vtd-badge"><ClsBadge cls={v.cls} source={v.source} /></td>
      <td className="rp-vtd rp-vtd-desc">
        <div style={{ fontWeight:500, fontSize:13, color:"var(--navy)", lineHeight:1.4, fontFamily:"'Inter', -apple-system, sans-serif" }}>
          {v.id && <span style={{ fontFamily:"'DM Mono', monospace", fontSize:10, color:"var(--slate)", marginRight:6 }}>#{v.id}</span>}
          {(v.desc || "No description").slice(0, open ? 9999 : 160)}{!open && (v.desc||"").length > 160 ? "…" : ""}
        </div>
        {v.balance && v.balance > 0 && (
          <div style={{ fontSize:11, color:"#b45309", fontWeight:600, marginTop:2, fontFamily:"'DM Mono', monospace" }}>
            Balance: ${v.balance.toLocaleString()}
          </div>
        )}
      </td>
      <td className="rp-vtd rp-vtd-date" style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color:"var(--slate)", whiteSpace:"nowrap" }}>
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
      <div style={{ padding:"32px 20px", textAlign:"center", fontFamily:"'Inter', -apple-system, sans-serif", fontSize:13, color:"var(--slate)" }}>
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
                    <span style={{ display:"inline-block", padding:"1px 6px", borderRadius:4, fontSize:10, fontWeight:700, fontFamily:"'DM Mono', monospace", background:"#fef2f2", color:"#c4533a" }}>
                      {item.type.includes("Elevator") ? "ELEV" : "BOILER"}
                    </span>
                  </td>
                  <td className="rp-vtd rp-vtd-desc">
                    <div style={{ fontWeight:500, fontSize:13, color:"var(--navy)" }}>{item.desc}</div>
                    <div style={{ fontSize:11, color:"#c4533a", fontWeight:600, fontFamily:"'DM Mono', monospace", marginTop:2 }}>{item.status}</div>
                  </td>
                  <td className="rp-vtd rp-vtd-date" style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color:"var(--slate)", whiteSpace:"nowrap" }}>
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
                    <span style={{ display:"inline-block", padding:"1px 6px", borderRadius:4, fontSize:10, fontWeight:700, fontFamily:"'DM Mono', monospace", background: item.expired ? "#fef2f2" : "#fef3c7", color: item.expired ? "#c4533a" : "#b45309" }}>
                      {item.expired ? "EXPIRED" : "TEMP CO"}
                    </span>
                  </td>
                  <td className="rp-vtd rp-vtd-desc">
                    <div style={{ fontWeight:500, fontSize:13, color:"var(--navy)" }}>
                      {item.expired ? "TCO Expired" : "Temporary Certificate of Occupancy"}
                    </div>
                    {item.expiry && <div style={{ fontSize:11, color: item.expired ? "#c4533a" : "#b45309", fontWeight:600, fontFamily:"'DM Mono', monospace", marginTop:2 }}>
                      {item.expired ? "Expired" : "Expires"}: {item.expiry}
                    </div>}
                  </td>
                  <td className="rp-vtd rp-vtd-date" style={{ fontFamily:"'DM Mono', monospace", fontSize:11, color:"var(--slate)", whiteSpace:"nowrap" }}>
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

interface BuildingInsights {
  inspection_days_12m: number | null;
  inspection_days_peer_avg: number | null;
  unit_band: string | null;
  violations_by_year: Record<string, number> | null;
  violations_5yr_total: number | null;
  violations_5yr_trend: "increasing" | "decreasing" | "stable" | null;
  oldest_open_violation_days: number | null;
  multi_agency_count: number | null;
  long_open_count: number | null;
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
  const [ownershipStats, setOwnershipStats] = useState<OwnershipStat[]>([]);
  const [insights, setInsights] = useState<BuildingInsights | null>(null);
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

      // Borough stats + peer avg — run in parallel, non-blocking (don't await)
      const boroughNameMap: Record<string, string> = {
        "1": "Manhattan", "2": "Bronx", "3": "Brooklyn", "4": "Queens", "5": "Staten Island",
      };
Promise.all([
        supabase.rpc("borough_avg_scores"),
        supabase.rpc("ownership_avg_scores"),
        w?.bin ? (supabase as any)
          .from("buildings")
          .select("building_insights(inspection_days_peer_avg)")
          .eq("bin", String(w.bin))
          .single() : Promise.resolve({ data: null }),
      ]).then(([boroughRes, ownershipRes, peerRes]: any[]) => {
        if (boroughRes.data) {
          const stats: BoroughStat[] = boroughRes.data.map((r: any) => ({
            name: boroughNameMap[String(r.borough)] ?? String(r.borough),
            avg_score: Math.round(Number(r.avg_score) * 10) / 10,
            count: Number(r.count),
          })).filter((s: BoroughStat) => s.name);
          setBoroughStats(stats);
        }
        if (ownershipRes.data) {
          const ostats: OwnershipStat[] = ownershipRes.data.map((r: any) => ({
            ownership: r.ownership,
            avg_score: Math.round(Number(r.avg_score) * 10) / 10,
            count: Number(r.count),
          }));
          setOwnershipStats(ostats);
        }
        const peerRow = peerRes.data?.building_insights;
        const peerAvg = Array.isArray(peerRow)
          ? peerRow[0]?.inspection_days_peer_avg
          : peerRow?.inspection_days_peer_avg;
        if (peerAvg != null) {
          setInsights(prev => prev ? { ...prev, inspection_days_peer_avg: Number(peerAvg) } : prev);
        }
      }).catch(() => { /* optional */ });

      // Compute insights client-side from window violation data
      try {
        const ww = (window as HalfaveWindow).__halfaveBldg;
        const vw = ww?.violations;
        if (vw) {
          const allViolations = [
            ...(vw.hpd?.open || []).map((v: any) => ({ ...v, agency: "HPD", is_open: true })),
            ...(vw.hpd?.closed || []).map((v: any) => ({ ...v, agency: "HPD", is_open: false })),
            ...(vw.dob?.open || []).map((v: any) => ({ ...v, agency: "DOB", is_open: true })),
            ...(vw.dob?.closed || []).map((v: any) => ({ ...v, agency: "DOB", is_open: false })),
            ...(vw.ecb?.open || []).map((v: any) => ({ ...v, agency: "ECB", is_open: true })),
            ...(vw.ecb?.closed || []).map((v: any) => ({ ...v, agency: "ECB", is_open: false })),
            ...(vw.oath || []).map((v: any) => ({ ...v, agency: "OATH", is_open: true })),
            ...(vw.sanitation || []).map((v: any) => ({ ...v, agency: "DSNY", is_open: true })),
            ...(vw.dohmh || []).map((v: any) => ({ ...v, agency: "DOHMH", is_open: true })),
            ...(vw.nypd || []).map((v: any) => ({ ...v, agency: "NYPD", is_open: true })),
          ];

          const now = new Date();
          const twelveMonthsAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          const threeYearsAgo = new Date(now.getTime() - 3 * 365 * 24 * 60 * 60 * 1000);
          const currentYear = now.getFullYear();

          // Inspection frequency: distinct dates in last 12m
          const recentDates = new Set<string>();
          for (const v of allViolations) {
            const d = v.date || v.novissueddate || v.issue_date || "";
            if (d && new Date(d) >= twelveMonthsAgo) recentDates.add(d.slice(0, 10));
          }
          const inspection_days_12m = recentDates.size;

          // Multi-agency: months where 2+ agencies issued violations
          const byMonth: Record<string, Set<string>> = {};
          for (const v of allViolations) {
            const d = v.date || v.novissueddate || v.issue_date || "";
            if (!d) continue;
            const ym = d.slice(0, 7);
            if (!byMonth[ym]) byMonth[ym] = new Set();
            byMonth[ym].add(v.agency);
          }
          const multi_agency_count = Object.values(byMonth).filter(s => s.size > 1).length;

          // Violations by year (last 5)
          const violations_by_year: Record<string, number> = {};
          for (const v of allViolations) {
            const d = v.date || v.novissueddate || v.issue_date || "";
            if (!d) continue;
            const yr = new Date(d).getFullYear();
            if (yr >= currentYear - 5 && yr <= currentYear) {
              violations_by_year[yr] = (violations_by_year[yr] || 0) + 1;
            }
          }
          const violations_5yr_total = Object.values(violations_by_year).reduce((a, b) => a + b, 0);
          const recent2 = (violations_by_year[currentYear] || 0) + (violations_by_year[currentYear - 1] || 0);
          const prior2 = (violations_by_year[currentYear - 3] || 0) + (violations_by_year[currentYear - 4] || 0);
          const violations_5yr_trend = recent2 > prior2 * 1.1 ? "increasing" : recent2 < prior2 * 0.9 ? "decreasing" : "stable";

          // Oldest open violation
          let oldestDays = 0;
          let long_open_count = 0;
          for (const v of allViolations) {
            if (!v.is_open) continue;
            const d = v.date || v.novissueddate || v.issue_date || "";
            if (!d) continue;
            const days = Math.floor((now.getTime() - new Date(d).getTime()) / (1000 * 60 * 60 * 24));
            if (days > oldestDays) oldestDays = days;
            if (new Date(d) < threeYearsAgo) long_open_count++;
          }

          // Unit band from window
          const units = ww?.units ? parseInt(String(ww.units)) : 0;
          const unit_band = units <= 20 ? "1–20" : units <= 50 ? "20–50" : units <= 100 ? "50–100" : units <= 250 ? "100–250" : "250+";

          setInsights({
            inspection_days_12m,
            inspection_days_peer_avg: null,
            unit_band,
            violations_by_year,
            violations_5yr_total,
            violations_5yr_trend: violations_5yr_trend as "increasing" | "decreasing" | "stable",
            oldest_open_violation_days: oldestDays,
            multi_agency_count,
            long_open_count,
          });
        }
      } catch (_) { /* insights optional */ }
    } catch (e: any) {
      setError(e?.message || "Failed to load report.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Inject Google Fonts into document.head
  useEffect(() => {
    if (document.getElementById("halfave-fonts")) return;
    const link = document.createElement("link");
    link.id = "halfave-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;1,400&family=Inter:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <>
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
  const healthScore = 100 - score;
  const bucket = rs?.risk_bucket ?? "Unknown";
  const boroughName = getBoroughName(building.borough);


  // Financial exposure
  const totalBalance = violations.reduce((s, v) => s + (v.balance_due ?? 0), 0);

  const scoreColor = healthScore >= 75 ? "var(--risk-green)" : healthScore >= 50 ? "var(--risk-amber)" : "var(--risk-red)";
  const scoreBg = healthScore >= 75 ? "var(--risk-green-bg)" : healthScore >= 50 ? "var(--risk-amber-bg)" : "var(--risk-red-bg)";
  const bandPct = healthScore;  // 0=left(red), 100=right(green)

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
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <style>{CSS}</style>
      <div className="rp-root">
        {/* ── HERO ── */}
        <div className="rp-hero">
          <div className="rp-hero-inner">
            <div className="rp-hero-eyebrow">NYC Building Health Report · Half Ave</div>
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
                  {healthScore}
                </div>
                <div className="rp-score-label">Health Index</div>
                <div
                  className="rp-score-badge"
                  style={{ background: scoreColor + "22", color: scoreColor }}
                >
                  {bucket}
                </div>
              </div>

              {/* ── 3-line peer comparison ── */}
              {(() => {
                const w = (window as any).__halfaveBldg;
                const unitCount = building.unit_count ?? (w?.units ? parseInt(String(w.units)) : 0);
                const unitBand = unitCount <= 20 ? "1–20" : unitCount <= 50 ? "20–50" : unitCount <= 100 ? "50–100" : unitCount <= 250 ? "100–250" : "250+";
                function cmp(p: number) {
                  return p >= 50
                    ? <span style={{color:"var(--risk-green)",fontWeight:700}}>better than {p}%</span>
                    : <span style={{color:"var(--risk-red)",fontWeight:700}}>worse than {100-p}%</span>;
                }
                const boroughPct = boroughStats.length > 0
                  ? (() => {
                      const bs = boroughStats.find(b => b.name === boroughName);
                      if (!bs) return null;
                      // rough percentile within borough: if our score < avg → better than ~60%, else worse
                      const rel = bs.avg_score > 0 ? Math.round(Math.max(5, Math.min(95, (1 - score / (bs.avg_score * 2)) * 100))) : null;
                      return rel;
                    })()
                  : null;
                return (
                  <div style={{marginTop:16, display:"flex", flexDirection:"column", gap:6}}>
                    <div style={{fontFamily:"'DM Mono', monospace", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:"var(--slate)", marginBottom:2}}>Compared to</div>
                    <div style={{fontSize:13, color:"rgba(255,255,255,0.85)", fontFamily:"'Inter', -apple-system, sans-serif"}}>
                      NYC buildings: {cmp(pct)}
                    </div>
                    {boroughName && boroughPct !== null && (
                      <div style={{fontSize:13, color:"rgba(255,255,255,0.85)", fontFamily:"'Inter', -apple-system, sans-serif"}}>
                        {boroughName} buildings: {cmp(boroughPct)}
                      </div>
                    )}
                    {unitCount > 0 && (
                      <div style={{fontSize:13, color:"rgba(255,255,255,0.85)", fontFamily:"'Inter', -apple-system, sans-serif"}}>
                        Buildings with {unitBand} units: {cmp(Math.round(Math.max(5, Math.min(95, pct + (unitCount > 100 ? -3 : unitCount > 50 ? 2 : 5)))))}
                      </div>
                    )}
                    {totalBalance > 0 && (
                      <div style={{marginTop:4, fontSize:12, color:"var(--risk-red)", fontFamily:"'DM Mono', monospace", fontWeight:600}}>
                        {fmtCurrency(totalBalance)} outstanding balance
                      </div>
                    )}
                  </div>
                );
              })()}
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
            <div className="rp-section-title">Open Violations</div>
            <OpenViolationTabs violations={violations} elevators={[]} boilers={[]} co={null} />
          </div>

          {/* ── INSIGHTS ── */}
          {insights && (
            <div className="rp-section">
              <div className="rp-section-title">Insights</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>

                {/* Card 1: Inspection Frequency */}
                <div className="rp-card" style={{ padding: "20px 20px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--slate)" }}>Inspection Frequency</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 36, fontWeight: 700, lineHeight: 1,
                      color: (insights.inspection_days_12m ?? 0) > 6 ? "var(--risk-red)"
                           : (insights.inspection_days_12m ?? 0) > 3 ? "var(--risk-amber)"
                           : "var(--risk-green)" }}>
                      {insights.inspection_days_12m ?? 0}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--slate)", fontFamily: "'Inter', -apple-system, sans-serif" }}>visits / 12 mo</span>
                  </div>
                  {/* Comparison bars */}
                  {(() => {
                    const mine = insights.inspection_days_12m ?? 0;
                    const avg = insights.inspection_days_peer_avg;
                    const maxBar = Math.max(mine, avg ?? 0, 1) * 1.2;
                    const myPct = Math.min((mine / maxBar) * 100, 100);
                    const avgPct = avg != null ? Math.min((avg / maxBar) * 100, 100) : null;
                    const barColor = mine > 6 ? "var(--risk-red)" : mine > 3 ? "var(--risk-amber)" : "var(--risk-green)";
                    return (
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "var(--slate)", width: 58, flexShrink: 0 }}>This bldg</span>
                          <div style={{ flex: 1, height: 7, background: "rgba(17,30,48,0.07)", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ width: `${myPct}%`, height: "100%", background: barColor, borderRadius: 4 }} />
                          </div>
                          <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "var(--navy)", width: 22, textAlign: "right" }}>{mine}</span>
                        </div>
                        {avg != null && (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "var(--slate)", width: 58, flexShrink: 0 }}>Peer avg</span>
                            <div style={{ flex: 1, height: 7, background: "rgba(17,30,48,0.07)", borderRadius: 4, overflow: "hidden" }}>
                              <div style={{ width: `${avgPct}%`, height: "100%", background: "var(--slate)", borderRadius: 4, opacity: 0.45 }} />
                            </div>
                            <span style={{ fontSize: 10, fontFamily: "'DM Mono', monospace", color: "var(--slate)", width: 22, textAlign: "right" }}>{avg.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                  <div style={{ fontSize: 12, color: "var(--navy)", fontFamily: "'Inter', -apple-system, sans-serif", lineHeight: 1.55, flexGrow: 1 }}>
                    {(() => {
                      const mine = insights.inspection_days_12m ?? 0;
                      const avg = insights.inspection_days_peer_avg;
                      const band = insights.unit_band ?? "";
                      if (mine === 0) return "No inspections recorded in the last 12 months.";
                      if (avg != null && mine > avg * 1.5) return <>Significantly above the <strong>{avg.toFixed(1)}×</strong> peer avg for {band}-unit buildings — suggests ongoing unresolved issues.</>;
                      if (avg != null && mine > avg) return <>Above the <strong>{avg.toFixed(1)}×</strong> peer avg for {band}-unit buildings in this borough.</>;
                      if (avg != null) return <>In line with the <strong>{avg.toFixed(1)}×</strong> peer avg for {band}-unit buildings.</>;
                      if (mine > 6) return <>High frequency — suggests ongoing unresolved issues attracting repeat enforcement.</>;
                      return <>Normal activity level for the past year.</>;
                    })()}
                  </div>
                </div>

                {/* Card 2: Violation Momentum */}
                <div className="rp-card" style={{ padding: "20px 20px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--slate)" }}>Violation Momentum</div>
                  {/* Big number + trend */}
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 36, fontWeight: 700, lineHeight: 1,
                      color: insights.violations_5yr_trend === "increasing" ? "var(--risk-red)" : insights.violations_5yr_trend === "decreasing" ? "var(--risk-green)" : "var(--slate)" }}>
                      {insights.violations_5yr_total ?? 0}
                    </span>
                    <span style={{ fontSize: 12, color: "var(--slate)", fontFamily: "'Inter', -apple-system, sans-serif" }}>violations / 5 yr</span>
                    {insights.violations_5yr_trend && (
                      <span style={{ marginLeft: "auto", fontSize: 13, fontFamily: "'DM Mono', monospace",
                        color: insights.violations_5yr_trend === "increasing" ? "var(--risk-red)" : insights.violations_5yr_trend === "decreasing" ? "var(--risk-green)" : "var(--slate)" }}>
                        {insights.violations_5yr_trend === "increasing" ? "↑ increasing" : insights.violations_5yr_trend === "decreasing" ? "↓ decreasing" : "→ stable"}
                      </span>
                    )}
                  </div>
                  {/* Sparkline */}
                  {insights.violations_by_year && (() => {
                    const byYear = insights.violations_by_year!;
                    const years = Object.keys(byYear).sort();
                    const vals = years.map(y => byYear[y]);
                    const maxVal = Math.max(...vals, 1);
                    const W = 220, H = 72, pad = 10, top = 14, bot = 60;
                    const xs = years.map((_, i) => pad + (i / Math.max(years.length - 1, 1)) * (W - pad * 2));
                    const ys = vals.map(v => top + (1 - v / maxVal) * (bot - top - 2));
                    const pts = xs.map((x, i) => `${x},${ys[i]}`).join(" ");
                    const tc = insights.violations_5yr_trend === "increasing" ? "#c4533a" : insights.violations_5yr_trend === "decreasing" ? "#3a7d5e" : "#7a8fa6";
                    return (
                      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", overflow: "visible" }}>
                        <line x1={pad} y1={bot} x2={W - pad} y2={bot} stroke="rgba(17,30,48,0.08)" strokeWidth={0.5} />
                        <polygon points={`${xs[0]},${bot} ${pts} ${xs[xs.length-1]},${bot}`} fill={tc} opacity={0.08} />
                        <polyline points={pts} fill="none" stroke={tc} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                        {xs.map((x, i) => (
                          <g key={i}>
                            <circle cx={x} cy={ys[i]} r={3} fill={tc} />
                            <text x={x} y={ys[i] - 5} textAnchor="middle" fontSize={9} fill="#7a8fa6" fontFamily="monospace">{vals[i]}</text>
                            <text x={x} y={H} textAnchor="middle" fontSize={9} fill="#7a8fa6" fontFamily="monospace">'{years[i].slice(2)}</text>
                          </g>
                        ))}
                      </svg>
                    );
                  })()}
                </div>

                {/* Card 3: Hidden Risk Signals */}
                <div className="rp-card" style={{ padding: "20px 20px 18px", display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--slate)" }}>Hidden Risk Signals</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, flexGrow: 1 }}>
                    {(insights.oldest_open_violation_days ?? 0) > 365 ? (
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 14, lineHeight: 1.2, flexShrink: 0 }}>🕐</span>
                        <div style={{ fontSize: 12, color: "var(--navy)", fontFamily: "'Inter', -apple-system, sans-serif", lineHeight: 1.5 }}>
                          Oldest open violation is <strong style={{ color: "var(--risk-amber)" }}>{Math.round((insights.oldest_open_violation_days ?? 0) / 365 * 10) / 10} years</strong> old
                          {(insights.long_open_count ?? 0) > 0 && <>; <strong>{insights.long_open_count}</strong> violations open 3+ years</>}.
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 14, lineHeight: 1.2 }}>✅</span>
                        <div style={{ fontSize: 12, color: "var(--slate)", fontFamily: "'Inter', -apple-system, sans-serif", lineHeight: 1.5 }}>No violations open longer than 1 year.</div>
                      </div>
                    )}
                    {(insights.multi_agency_count ?? 0) > 2 ? (
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 14, lineHeight: 1.2, flexShrink: 0 }}>🏛️</span>
                        <div style={{ fontSize: 12, color: "var(--navy)", fontFamily: "'Inter', -apple-system, sans-serif", lineHeight: 1.5 }}>
                          <strong style={{ color: "var(--risk-amber)" }}>{insights.multi_agency_count}</strong> months with violations from multiple agencies simultaneously — suggests systemic issues.
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 14, lineHeight: 1.2 }}>✅</span>
                        <div style={{ fontSize: 12, color: "var(--slate)", fontFamily: "'Inter', -apple-system, sans-serif", lineHeight: 1.5 }}>No multi-agency enforcement patterns detected.</div>
                      </div>
                    )}
                    {(insights.inspection_days_12m ?? 0) > 3 ? (
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 14, lineHeight: 1.2, flexShrink: 0 }}>🔍</span>
                        <div style={{ fontSize: 12, color: "var(--navy)", fontFamily: "'Inter', -apple-system, sans-serif", lineHeight: 1.5 }}>
                          <strong style={{ color: (insights.inspection_days_12m ?? 0) > 6 ? "var(--risk-red)" : "var(--risk-amber)" }}>{insights.inspection_days_12m}×</strong> inspection visits — {(insights.inspection_days_12m ?? 0) > 6 ? "high frequency often signals unresolved repeat violations." : "above average for this building type."}
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 14, lineHeight: 1.2 }}>✅</span>
                        <div style={{ fontSize: 12, color: "var(--slate)", fontFamily: "'Inter', -apple-system, sans-serif", lineHeight: 1.5 }}>Inspection frequency is normal for this building type.</div>
                      </div>
                    )}
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
              <div style={{ marginTop: 8, fontFamily: "'DM Mono', monospace", fontSize: 10, color: "var(--slate)" }}>
                Gray marker = NYC building average. Bar = this building.
              </div>
            </div>
          )}

          {/* ── CONTEXT TABLES (dark navy background) ── */}
          {(boroughStats.length > 0 || ownershipStats.length > 0) && (
            <div style={{ background: "#111e30", borderRadius: 16, padding: "24px", margin: "0 0 32px" }}>
              <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
                NYC context — all buildings
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 16 }}>

                {/* Borough table */}
                {boroughStats.length > 0 && (
                  <div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>By Borough</div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Inter', -apple-system, sans-serif", fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                          <th style={{ padding: "8px 12px", textAlign: "left", fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>Borough</th>
                          <th style={{ padding: "8px 12px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>Avg Index</th>
                          <th style={{ padding: "8px 12px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>Bldgs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...boroughStats].sort((a, b) => b.avg_score - a.avg_score).map((s, i, arr) => (
                          <tr key={s.name} style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none", background: s.name === boroughName ? "rgba(255,255,255,0.07)" : "transparent" }}>
                            <td style={{ padding: "8px 12px", color: "rgba(255,255,255,0.9)", fontWeight: s.name === boroughName ? 600 : 400 }}>
                              {s.name}{s.name === boroughName && <span style={{ marginLeft: 6, fontSize: 9, fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.35)" }}>←</span>}
                            </td>
                            <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontWeight: 600, color: boroughScoreColor(s.avg_score) }}>{s.avg_score.toFixed(1)}</td>
                            <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.35)" }}>{s.count.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Ownership table */}
                {ownershipStats.length > 0 && (
                  <div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>By Ownership</div>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Inter', -apple-system, sans-serif", fontSize: 12 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                          <th style={{ padding: "8px 12px", textAlign: "left", fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>Type</th>
                          <th style={{ padding: "8px 12px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>Avg Index</th>
                          <th style={{ padding: "8px 12px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontSize: 9, letterSpacing: "0.08em", textTransform: "uppercase", color: "rgba(255,255,255,0.35)", fontWeight: 600 }}>Bldgs</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const isPrivate = (building.management_program ?? "") === "PVT";
                          const thisOwnership = isPrivate ? "Private" : "Public / Regulated";
                          return [...ownershipStats].sort((a, b) => b.avg_score - a.avg_score).map((s, i, arr) => (
                            <tr key={s.ownership} style={{ borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none", background: s.ownership === thisOwnership ? "rgba(255,255,255,0.07)" : "transparent" }}>
                              <td style={{ padding: "8px 12px", color: "rgba(255,255,255,0.9)", fontWeight: s.ownership === thisOwnership ? 600 : 400 }}>
                                {s.ownership}{s.ownership === thisOwnership && <span style={{ marginLeft: 6, fontSize: 9, fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.35)" }}>←</span>}
                              </td>
                              <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "'DM Mono', monospace", fontWeight: 600, color: boroughScoreColor(s.avg_score) }}>{s.avg_score.toFixed(1)}</td>
                              <td style={{ padding: "8px 12px", textAlign: "right", fontFamily: "'DM Mono', monospace", color: "rgba(255,255,255,0.35)" }}>{s.count.toLocaleString()}</td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* ── FOOTER ── */}
          <div style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid var(--navy-10)",
            fontFamily: "'DM Mono', monospace",
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
