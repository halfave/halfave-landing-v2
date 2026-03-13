import React, { useState, useEffect } from 'react'

import type { Building, PivotRow } from '../types'
import { RISK_COLORS, RISK_ORDER } from '../types'
import { useRiskData } from '../hooks/useRiskData'
import { supabase } from '../lib/supabase'

interface Props {
  building: Building
  email: string
  onReset: () => void
  onGoRisk?: () => void
}

// ─── Violation types ──────────────────────────────────────────────────────────
interface Violation {
  id: string
  source: string
  violation_type: string | null
  violation_date: string | null
  description: string | null
  severity: string | null
  category: string | null
  is_open: boolean | null
  disposition: string | null
  balance_due: number | null
  order_number: string | null
}

// ─── Violation tabs ───────────────────────────────────────────────────────────
const SOURCE_LABELS: Record<string, string> = {
  HPD: 'HPD — Housing',
  DOB: 'DOB — Building',
  ECB: 'ECB — Environmental',
  Sanitation: 'Sanitation',
  DOHMH: 'DOHMH — Health',
}

const SOURCE_ORDER = ['HPD', 'DOB', 'ECB', 'Sanitation', 'DOHMH']

const SEVERITY_COLORS: Record<string, string> = {
  'A': '#3a7d5e',
  'B': '#c9a227',
  'C': '#c4533a',
  'I': '#c4533a',
  'CLASS - 1': '#c4533a',
  'CLASS - 2': '#d97b3a',
  'Non-Hazardous': '#7a8fa6',
}

function severityLabel(v: Violation): string {
  if (v.source === 'HPD') {
    const map: Record<string, string> = { A: 'Non-Haz', B: 'Hazardous', C: 'Immediately Haz', I: 'Info' }
    return map[v.severity ?? ''] ?? v.severity ?? '—'
  }
  if (v.severity === 'CLASS - 1') return 'Class 1'
  if (v.severity === 'CLASS - 2') return 'Class 2'
  return v.severity ?? '—'
}

function ViolationTabs({ buildingId }: { buildingId: string }) {
  const [violations, setViolations] = useState<Violation[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('')

  useEffect(() => {
    async function load() {
      const db = (supabase as any).schema('analytics')
      const { data } = await db
        .from('violations')
        .select('id,source,violation_type,violation_date,description,severity,category,is_open,disposition,balance_due,order_number')
        .eq('building_id', buildingId)
        .order('violation_date', { ascending: false })
      const rows: Violation[] = data ?? []
      setViolations(rows)
      // set default tab to source with most violations
      const counts: Record<string, number> = {}
      for (const r of rows) counts[r.source] = (counts[r.source] ?? 0) + 1
      const first = SOURCE_ORDER.find(s => counts[s] > 0) ?? Object.keys(counts)[0] ?? ''
      setActiveTab(first)
      setLoading(false)
    }
    load()
  }, [buildingId])

  const grouped = violations.reduce<Record<string, Violation[]>>((acc, v) => {
    if (!acc[v.source]) acc[v.source] = []
    acc[v.source].push(v)
    return acc
  }, {})

  const tabs = SOURCE_ORDER.filter(s => grouped[s]?.length)
  const rows = grouped[activeTab] ?? []

  if (loading) return (
    <div style={vt.loading}>Loading violations…</div>
  )

  if (violations.length === 0) return (
    <div style={vt.empty}>No violations on record for this building.</div>
  )

  return (
    <div style={vt.wrap}>
      {/* Tab bar */}
      <div style={vt.tabBar}>
        {tabs.map(src => (
          <button
            key={src}
            style={{ ...vt.tab, ...(activeTab === src ? vt.tabActive : {}) }}
            onClick={() => setActiveTab(src)}
          >
            <span>{SOURCE_LABELS[src] ?? src}</span>
            <span style={{ ...vt.tabBadge, ...(activeTab === src ? vt.tabBadgeActive : {}) }}>
              {grouped[src].length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={vt.tableWrap}>
        <table style={vt.table}>
          <thead>
            <tr>
              <th style={vt.th}>Date</th>
              {activeTab === 'HPD' && <th style={vt.th}>Order #</th>}
              <th style={vt.th}>Description</th>
              <th style={vt.th}>Severity</th>
              <th style={vt.th}>Status</th>
              {activeTab === 'ECB' && <th style={{ ...vt.th, textAlign: 'right' }}>Balance</th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((v, i) => {
              const sevColor = SEVERITY_COLORS[v.severity ?? ''] ?? '#7a8fa6'
              const isOpen = v.disposition?.toLowerCase().includes('open') || v.is_open
              return (
                <tr key={v.id ?? i} style={{ borderBottom: '1px solid rgba(17,30,48,0.06)' }}>
                  <td style={vt.tdDate}>
                    {v.violation_date ? new Date(v.violation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                  </td>
                  {activeTab === 'HPD' && (
                    <td style={vt.tdMono}>{v.order_number ?? '—'}</td>
                  )}
                  <td style={vt.tdDesc}>{v.description ?? v.category ?? '—'}</td>
                  <td style={vt.tdSev}>
                    {v.severity ? (
                      <span style={{ ...vt.sevBadge, color: sevColor, borderColor: sevColor }}>
                        {severityLabel(v)}
                      </span>
                    ) : '—'}
                  </td>
                  <td style={vt.tdStatus}>
                    <span style={{ ...vt.statusDot, background: isOpen ? '#c4533a' : '#3a7d5e' }} />
                    {isOpen ? 'Open' : 'Resolved'}
                  </td>
                  {activeTab === 'ECB' && (
                    <td style={{ ...vt.tdMono, textAlign: 'right' }}>
                      {v.balance_due != null && v.balance_due > 0
                        ? `$${Number(v.balance_due).toLocaleString()}`
                        : '—'}
                    </td>
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const vt: Record<string, React.CSSProperties> = {
  wrap: {
    background: 'var(--white)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--navy-20)', overflow: 'hidden',
  },
  tabBar: {
    display: 'flex', overflowX: 'auto', borderBottom: '1px solid var(--navy-20)',
    background: 'rgba(17,30,48,0.02)',
  },
  tab: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '12px 20px', border: 'none', borderBottom: '2px solid transparent',
    background: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
    fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
    color: 'var(--navy)', opacity: 0.45, transition: 'all 0.15s',
  },
  tabActive: {
    opacity: 1, borderBottomColor: 'var(--navy)',
    background: 'var(--white)',
  },
  tabBadge: {
    background: 'rgba(17,30,48,0.08)', color: 'var(--navy)',
    borderRadius: 99, padding: '1px 7px',
    fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
  },
  tabBadgeActive: {
    background: 'var(--navy)', color: 'var(--cream)',
  },
  tableWrap: { overflowX: 'auto', maxHeight: 420, overflowY: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' },
  th: {
    fontFamily: 'var(--font-mono)', fontSize: '0.62rem', textTransform: 'uppercase',
    letterSpacing: '0.08em', opacity: 0.4, padding: '10px 16px',
    textAlign: 'left', borderBottom: '1px solid var(--navy-20)',
    position: 'sticky' as const, top: 0, background: 'var(--white)',
  },
  tdDate: { padding: '11px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', opacity: 0.6, whiteSpace: 'nowrap', verticalAlign: 'top' },
  tdMono: { padding: '11px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', opacity: 0.55, whiteSpace: 'nowrap', verticalAlign: 'top' },
  tdDesc: { padding: '11px 16px', lineHeight: 1.5, maxWidth: 420, verticalAlign: 'top', fontSize: '0.8rem' },
  tdSev: { padding: '11px 16px', whiteSpace: 'nowrap', verticalAlign: 'top' },
  tdStatus: {
    padding: '11px 16px', fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
    whiteSpace: 'nowrap', verticalAlign: 'top', display: 'flex', alignItems: 'center', gap: 6,
  },
  sevBadge: {
    fontFamily: 'var(--font-mono)', fontSize: '0.62rem', textTransform: 'uppercase',
    letterSpacing: '0.06em', border: '1px solid', borderRadius: 99, padding: '2px 8px',
  },
  statusDot: { width: 6, height: 6, borderRadius: '50%', display: 'inline-block', flexShrink: 0 },
  loading: { padding: 32, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.4, textAlign: 'center' },
  empty: { padding: 32, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.4, textAlign: 'center' },
}

// ─── NYC Borough SVG Map ──────────────────────────────────────────────────────
// Simplified borough outlines as SVG paths (schematic, not geographic)
const BOROUGH_PATHS: Record<string, { path: string; label: string; cx: number; cy: number }> = {
  Manhattan: {
    path: 'M 185 60 L 195 55 L 205 58 L 210 80 L 215 110 L 218 140 L 215 170 L 208 195 L 200 210 L 192 215 L 185 210 L 178 195 L 172 170 L 170 140 L 172 110 L 178 80 Z',
    label: 'Manhattan', cx: 192, cy: 135,
  },
  Bronx: {
    path: 'M 185 60 L 195 55 L 220 45 L 260 42 L 290 50 L 300 70 L 295 95 L 275 105 L 250 110 L 225 108 L 210 100 L 210 80 L 205 58 Z',
    label: 'Bronx', cx: 248, cy: 75,
  },
  Brooklyn: {
    path: 'M 172 195 L 185 210 L 192 215 L 200 210 L 210 215 L 225 218 L 255 220 L 275 215 L 285 205 L 288 190 L 280 175 L 265 168 L 245 165 L 225 162 L 208 160 L 195 165 L 185 175 Z',
    label: 'Brooklyn', cx: 232, cy: 193,
  },
  Queens: {
    path: 'M 210 80 L 225 108 L 250 110 L 275 105 L 295 95 L 310 100 L 320 118 L 318 140 L 310 158 L 295 168 L 275 172 L 255 175 L 240 172 L 225 168 L 210 160 L 208 160 L 210 130 L 215 110 L 218 140 L 215 110 Z',
    label: 'Queens', cx: 268, cy: 138,
  },
  'Staten Island': {
    path: 'M 105 215 L 120 205 L 140 200 L 158 202 L 165 215 L 162 235 L 150 250 L 130 255 L 112 248 L 100 235 Z',
    label: 'SI', cx: 133, cy: 228,
  },
}

const BOROUGH_COLORS = {
  low: '#3a7d5e',
  mid: '#c9a227',
  high: '#c4533a',
}

function boroughScoreColor(score: number): string {
  if (score >= 35) return BOROUGH_COLORS.high
  if (score >= 20) return BOROUGH_COLORS.mid
  return BOROUGH_COLORS.low
}

interface BoroughMapProps {
  rows: PivotRow[]
}

function NYCBoroughMap({ rows }: BoroughMapProps) {
  const [hovered, setHovered] = useState<string | null>(null)

  // Compute avg score per borough from pivot rows
  const avgByBorough: Record<string, number> = {}
  for (const r of rows) {
    avgByBorough[r.label] = r.avg_score
  }

  return (
    <div style={bmap.wrap}>
      <div style={bmap.mapArea}>
        <svg viewBox="70 35 270 235" style={{ width: '100%', maxWidth: 380 }} xmlns="http://www.w3.org/2000/svg">
          {Object.entries(BOROUGH_PATHS).map(([name, def]) => {
            const score = avgByBorough[name] ?? 0
            const fill = boroughScoreColor(score)
            const isHovered = hovered === name
            return (
              <g key={name} onMouseEnter={() => setHovered(name)} onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer' }}>
                <path
                  d={def.path}
                  fill={fill}
                  fillOpacity={isHovered ? 0.9 : 0.6}
                  stroke="var(--cream)"
                  strokeWidth={isHovered ? 2 : 1.5}
                  style={{ transition: 'all 0.15s' }}
                />
                <text
                  x={def.cx} y={def.cy - 6}
                  textAnchor="middle"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', fill: 'var(--cream)', fontWeight: 600, pointerEvents: 'none' }}
                >
                  {def.label}
                </text>
                <text
                  x={def.cx} y={def.cy + 5}
                  textAnchor="middle"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', fill: 'var(--cream)', opacity: 0.9, pointerEvents: 'none' }}
                >
                  {score > 0 ? score.toFixed(1) : '—'}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Legend */}
        <div style={bmap.legend}>
          {[
            { color: BOROUGH_COLORS.low, label: '< 20 — Low' },
            { color: BOROUGH_COLORS.mid, label: '20–35 — Moderate' },
            { color: BOROUGH_COLORS.high, label: '> 35 — Elevated' },
          ].map(l => (
            <div key={l.label} style={bmap.legendRow}>
              <span style={{ ...bmap.legendDot, background: l.color }} />
              <span style={bmap.legendLabel}>{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hover tooltip / bar list */}
      <div style={bmap.sidebar}>
        <div style={bmap.sidebarTitle}>Avg risk score by borough</div>
        {rows.map(r => {
          const color = boroughScoreColor(r.avg_score)
          const isActive = hovered === r.label
          return (
            <div key={r.label}
              style={{ ...bmap.boroughRow, ...(isActive ? bmap.boroughRowActive : {}) }}
              onMouseEnter={() => setHovered(r.label)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={bmap.boroughLabel}>{r.label}</div>
              <div style={bmap.barTrack}>
                <div style={{ ...bmap.barFill, width: `${(r.avg_score / 50) * 100}%`, background: color }} />
              </div>
              <div style={{ ...bmap.boroughScore, color }}>{r.avg_score.toFixed(1)}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const bmap: Record<string, React.CSSProperties> = {
  wrap: {
    background: 'var(--white)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--navy-20)', padding: 24,
    display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'flex-start',
  },
  mapArea: { flex: '0 0 auto', display: 'flex', flexDirection: 'column', gap: 16 },
  legend: { display: 'flex', flexDirection: 'column', gap: 6 },
  legendRow: { display: 'flex', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 2, flexShrink: 0 },
  legendLabel: { fontFamily: 'var(--font-mono)', fontSize: '0.65rem', opacity: 0.6 },
  sidebar: { flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: 10 },
  sidebarTitle: {
    fontFamily: 'var(--font-serif)', fontSize: '0.95rem', fontWeight: 600,
    marginBottom: 6, letterSpacing: '-0.01em',
  },
  boroughRow: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '6px 8px', borderRadius: 6, cursor: 'default',
    transition: 'background 0.12s',
  },
  boroughRowActive: { background: 'rgba(17,30,48,0.04)' },
  boroughLabel: {
    fontFamily: 'var(--font-mono)', fontSize: '0.72rem', width: 100, flexShrink: 0, opacity: 0.7,
  },
  barTrack: { flex: 1, height: 6, background: 'rgba(17,30,48,0.08)', borderRadius: 99, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 99, transition: 'width 0.6s ease' },
  boroughScore: { fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 500, width: 32, textAlign: 'right' },
}

// ─── Ownership comparison (PVT vs NYCHA avg) ─────────────────────────────────
function OwnershipCard({ rows }: { rows: PivotRow[] }) {
  const pvt = rows.find(r => r.label === 'PVT')
  const nycha = rows.find(r => r.label === 'NYCHA')
  if (!pvt && !nycha) return null

  const entries = [
    pvt && { label: 'Private (PVT)', sublabel: `${pvt.total} buildings`, score: pvt.avg_score, color: '#7a8fa6' },
    nycha && { label: 'NYCHA', sublabel: `${nycha.total} buildings`, score: nycha.avg_score, color: '#c9a227' },
  ].filter(Boolean) as { label: string; sublabel: string; score: number; color: string }[]

  const max = Math.max(...entries.map(e => e.score), 40)

  return (
    <div style={own.wrap}>
      <div style={own.header}>
        <h3 style={own.title}>Ownership type: average risk</h3>
        <p style={own.sub}>Comparing private vs. public housing portfolios by average risk score</p>
      </div>
      <div style={own.cards}>
        {entries.map(e => (
          <div key={e.label} style={own.card}>
            <div style={own.cardLabel}>{e.label}</div>
            <div style={own.cardSub}>{e.sublabel}</div>
            <div style={own.cardBarTrack}>
              <div style={{ ...own.cardBarFill, width: `${(e.score / max) * 100}%`, background: e.color }} />
            </div>
            <div style={{ ...own.cardScore, color: e.color }}>{e.score.toFixed(1)}</div>
            <div style={own.cardScoreLabel}>avg risk score</div>
          </div>
        ))}
      </div>
    </div>
  )
}

const own: Record<string, React.CSSProperties> = {
  wrap: {
    background: 'var(--white)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--navy-20)', padding: 28,
  },
  header: { marginBottom: 24 },
  title: { fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 6 },
  sub: { fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.45, lineHeight: 1.5 },
  cards: { display: 'flex', gap: 20, flexWrap: 'wrap' },
  card: {
    flex: 1, minWidth: 180,
    padding: '20px 24px', borderRadius: 'var(--radius)',
    border: '1px solid var(--navy-20)', background: 'rgba(17,30,48,0.015)',
  },
  cardLabel: { fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1.05rem', marginBottom: 4 },
  cardSub: { fontFamily: 'var(--font-mono)', fontSize: '0.65rem', opacity: 0.4, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.06em' },
  cardBarTrack: { height: 6, background: 'rgba(17,30,48,0.08)', borderRadius: 99, overflow: 'hidden', marginBottom: 12 },
  cardBarFill: { height: '100%', borderRadius: 99, transition: 'width 0.6s ease' },
  cardScore: { fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 500, lineHeight: 1 },
  cardScoreLabel: { fontFamily: 'var(--font-mono)', fontSize: '0.65rem', opacity: 0.35, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 },
}

// ─── Risk scoring explainer ───────────────────────────────────────────────────
const SCORING_FACTORS = [
  {
    key: 'Open Violations',
    weight: '35%',
    color: '#c4533a',
    desc: 'Count of currently unresolved HPD, DOB, and ECB violations. Open violations signal active, unaddressed hazards. A building with 10+ open violations scores near the maximum on this dimension.',
  },
  {
    key: 'Recent Activity',
    weight: '25%',
    color: '#d97b3a',
    desc: 'Violations issued in the last 12 months. Recent activity indicates deteriorating conditions or a landlord unwilling or unable to maintain code compliance. Recency is weighted heavily because it reflects the current trajectory.',
  },
  {
    key: 'Severity Points',
    weight: '25%',
    color: '#c9a227',
    desc: 'A weighted tally of violation severity. Class C / Immediately Hazardous HPD violations and ECB Class 1 violations carry the most weight (5–10×). Class B hazardous violations carry moderate weight. Non-hazardous violations contribute minimally.',
  },
  {
    key: 'Unresolved Duration',
    weight: '15%',
    color: '#7a8fa6',
    desc: 'Average age of open violations in days. A violation that has been open for 2+ years signals systemic neglect and is treated as a persistent risk factor, even if it scores low on severity.',
  },
]

function ScoringExplainer({ building }: { building: Building }) {
  const drivers = building.top_drivers as Record<string, number> | null

  return (
    <div style={sc.wrap}>
      <div style={sc.header}>
        <h3 style={sc.title}>How the risk score is calculated</h3>
        <p style={sc.intro}>
          Each building's risk score is a weighted composite of four factors drawn from HPD, DOB, and ECB violation records.
          Scores are normalized across all 978 buildings in the index so that 50 = median risk.
        </p>
      </div>

      <div style={sc.factors}>
        {SCORING_FACTORS.map(f => {
          const driverVal = drivers?.[f.key.toLowerCase().replace(/ /g, '_')] as number | undefined
          return (
            <div key={f.key} style={sc.factor}>
              <div style={sc.factorTop}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ ...sc.dot, background: f.color }} />
                  <span style={sc.factorName}>{f.key}</span>
                </div>
                <span style={{ ...sc.weight, color: f.color }}>{f.weight}</span>
              </div>
              <div style={sc.barRow}>
                <div style={sc.barTrack}>
                  <div style={{ ...sc.barFill, width: f.weight, background: f.color + '40', border: `1px solid ${f.color}40` }} />
                </div>
              </div>
              <p style={sc.factorDesc}>{f.desc}</p>
              {driverVal !== undefined && (
                <div style={{ ...sc.driverTag, borderColor: f.color + '60', color: f.color }}>
                  This building's contribution: <strong>{Math.round(driverVal * 100)}%</strong> of total score
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={sc.footer}>
        <div style={sc.footerGrid}>
          <div style={sc.footerItem}>
            <div style={sc.footerItemTitle}>Data Sources</div>
            <div style={sc.footerItemBody}>NYC HPD Open Data · NYC DOB BIS · NYC ECB Violations · NYC Open Data Portal</div>
          </div>
          <div style={sc.footerItem}>
            <div style={sc.footerItemTitle}>Scoring Method</div>
            <div style={sc.footerItemBody}>Each factor is percentile-ranked across the full index, then linearly combined using the weights above. Final scores range 0–100.</div>
          </div>
          <div style={sc.footerItem}>
            <div style={sc.footerItemTitle}>Last Updated</div>
            <div style={sc.footerItemBody}>March 2026. Violation data synced monthly from NYC Open Data APIs.</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const sc: Record<string, React.CSSProperties> = {
  wrap: {
    background: 'var(--white)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--navy-20)', overflow: 'hidden',
  },
  header: {
    padding: '28px 28px 0',
    marginBottom: 24,
  },
  title: { fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 10 },
  intro: { fontFamily: 'inherit', fontSize: '0.88rem', lineHeight: 1.7, opacity: 0.65, maxWidth: 600 },
  factors: { padding: '0 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 28 },
  factor: {
    padding: '18px 20px', borderRadius: 'var(--radius)',
    border: '1px solid var(--navy-20)', background: 'rgba(17,30,48,0.015)',
  },
  factorTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 2, flexShrink: 0 },
  factorName: { fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '0.9rem' },
  weight: { fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 500 },
  barRow: { marginBottom: 12 },
  barTrack: { height: 4, background: 'rgba(17,30,48,0.06)', borderRadius: 99, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 99 },
  factorDesc: { fontSize: '0.78rem', lineHeight: 1.65, opacity: 0.6 },
  driverTag: {
    marginTop: 10, padding: '6px 10px',
    border: '1px solid', borderRadius: 'var(--radius-sm)',
    fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
  },
  footer: {
    background: 'rgba(17,30,48,0.03)', borderTop: '1px solid var(--navy-20)',
    padding: '20px 28px',
  },
  footerGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 },
  footerItem: {},
  footerItemTitle: {
    fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase',
    letterSpacing: '0.08em', opacity: 0.4, marginBottom: 6,
  },
  footerItemBody: { fontSize: '0.78rem', lineHeight: 1.6, opacity: 0.6 },
}

// ─── Risk bucket badge ────────────────────────────────────────────────────────
function RiskBadge({ bucket }: { bucket: string }) {
  const color = RISK_COLORS[bucket as keyof typeof RISK_COLORS] ?? '#7a8fa6'
  return (
    <span style={{
      fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      color, border: `1px solid ${color}`, borderRadius: 99, padding: '3px 10px',
    }}>
      {bucket}
    </span>
  )
}

// ─── Score gauge ──────────────────────────────────────────────────────────────
function ScoreGauge({ score, bucket }: { score: number; bucket: string }) {
  const color = RISK_COLORS[bucket as keyof typeof RISK_COLORS] ?? '#7a8fa6'
  const pct = score / 100
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = circ * 0.75
  const offset = dash * (1 - pct)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={140} height={100} viewBox="0 0 140 100">
        <circle cx={70} cy={78} r={r} fill="none" stroke="rgba(17,30,48,0.08)"
          strokeWidth={10} strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={0} strokeLinecap="round"
          transform="rotate(-225 70 78)" />
        <circle cx={70} cy={78} r={r} fill="none" stroke={color}
          strokeWidth={10} strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-225 70 78)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
        <text x={70} y={72} textAnchor="middle" dominantBaseline="middle"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 500, fill: color }}>
          {Math.round(score)}
        </text>
        <text x={70} y={90} textAnchor="middle"
          style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', fill: '#111e30', opacity: 0.4 }}>
          out of 100
        </text>
      </svg>
    </div>
  )
}

// ─── Top buildings table ──────────────────────────────────────────────────────
function TopTable({ buildings, currentId }: { buildings: Building[]; currentId: string }) {
  return (
    <div style={tbl.wrap}>
      <h3 style={tbl.title}>Highest-risk buildings in the index</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={tbl.table}>
          <thead>
            <tr>
              <th style={tbl.th}>#</th>
              <th style={tbl.th}>Address</th>
              <th style={tbl.th}>Borough</th>
              <th style={tbl.th}>Mgmt</th>
              <th style={{ ...tbl.th, textAlign: 'right' }}>Score</th>
              <th style={{ ...tbl.th, textAlign: 'right' }}>Risk</th>
            </tr>
          </thead>
          <tbody>
            {buildings.map((b, i) => (
              <tr key={b.id} style={{
                ...tbl.tr,
                background: b.id === currentId ? 'rgba(196,83,58,0.06)' : undefined,
                outline: b.id === currentId ? '1.5px solid rgba(196,83,58,0.25)' : undefined,
              }}>
                <td style={{ ...tbl.td, ...tbl.rank }}>{i + 1}</td>
                <td style={tbl.td}>
                  <span style={tbl.addr}>{b.address}</span>
                  {b.id === currentId && <span style={tbl.you}>← you</span>}
                </td>
                <td style={tbl.td}>{b.borough_name}</td>
                <td style={{ ...tbl.td, ...tbl.mono }}>{b.management_program ?? '—'}</td>
                <td style={{ ...tbl.td, ...tbl.mono, textAlign: 'right', fontWeight: 500 }}>
                  {Math.round(b.risk_score)}
                </td>
                <td style={{ ...tbl.td, textAlign: 'right' }}>
                  <RiskBadge bucket={b.risk_bucket} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const tbl: Record<string, React.CSSProperties> = {
  wrap: { background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--navy-20)', overflow: 'hidden' },
  title: { fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 600, padding: '22px 24px 18px', borderBottom: '1px solid var(--navy-20)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: {
    fontFamily: 'var(--font-mono)', fontSize: '0.65rem', textTransform: 'uppercase',
    letterSpacing: '0.08em', opacity: 0.4, padding: '10px 16px',
    textAlign: 'left', borderBottom: '1px solid var(--navy-20)',
  },
  tr: { borderBottom: '1px solid rgba(17,30,48,0.06)' },
  td: { padding: '12px 16px', fontSize: '0.88rem', verticalAlign: 'middle' },
  rank: { fontFamily: 'var(--font-mono)', fontSize: '0.75rem', opacity: 0.35, width: 32 },
  addr: { fontWeight: 500 },
  you: { marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--red)', opacity: 0.8 },
  mono: { fontFamily: 'var(--font-mono)', fontSize: '0.8rem' },
}

// ─── Distribution bar ─────────────────────────────────────────────────────────
function DistributionBar({ by_bucket, total }: { by_bucket: Record<string, number>; total: number }) {
  return (
    <div style={dist.wrap}>
      <div style={dist.barWrap}>
        {RISK_ORDER.map(b => {
          const count = by_bucket[b] ?? 0
          const pct = (count / total) * 100
          return (
            <div key={b} style={{ ...dist.seg, width: `${pct}%`, background: RISK_COLORS[b] }}
              title={`${b}: ${count} (${pct.toFixed(1)}%)`} />
          )
        })}
      </div>
      <div style={dist.labels}>
        {RISK_ORDER.map(b => (
          <div key={b} style={dist.label}>
            <span style={{ ...dist.dot, background: RISK_COLORS[b] }} />
            <span style={dist.bucketName}>{b}</span>
            <span style={dist.count}>{by_bucket[b] ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const dist: Record<string, React.CSSProperties> = {
  wrap: { background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: 24, border: '1px solid var(--navy-20)' },
  barWrap: { display: 'flex', height: 10, borderRadius: 99, overflow: 'hidden', marginBottom: 20 },
  seg: { height: '100%', transition: 'width 0.6s ease' },
  labels: { display: 'flex', gap: 20, flexWrap: 'wrap' },
  label: { display: 'flex', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 2, display: 'inline-block', flexShrink: 0 },
  bucketName: { fontFamily: 'var(--font-mono)', fontSize: '0.72rem', opacity: 0.6 },
  count: { fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 500, marginLeft: 2 },
}

// ─── Main report ──────────────────────────────────────────────────────────────
export default function ReportPage({ building, email, onReset, onGoRisk: _onGoRisk }: Props) {
  const { data, loading } = useRiskData()
  const color = RISK_COLORS[building.risk_bucket] ?? '#7a8fa6'

  if (loading || !data) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.4 }}>Loading report…</div>
      </div>
    )
  }

  // Filter mgmt to PVT + NYCHA only
  const ownershipRows = data.by_mgmt.filter(r => r.label === 'PVT' || r.label === 'NYCHA')

  return (
    <div style={page.root}>
      {/* Nav */}
      <header style={page.header}>
        <span style={page.logo}>Half/Ave</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={page.emailTag}>{email}</span>
          <button style={page.reset} onClick={onReset}>New lookup</button>
        </div>
      </header>

      <main style={page.main}>

        {/* ── VIOLATIONS (top of report) ─────────────────────────── */}
        <section style={{ ...page.section, marginTop: 40 }}>
          <div style={page.sectionHeader}>
            <h2 style={page.sectionTitle}>Violation history</h2>
            <span style={page.sectionSub}>{building.address}</span>
          </div>
          <ViolationTabs buildingId={building.id} />
        </section>

        {/* ── HERO CARD ──────────────────────────────────────────── */}
        <section style={{ marginTop: 40 }}>
          <div style={{ ...page.hero, background: 'var(--navy)', color: 'var(--cream)' }}>
            <div style={page.heroLeft}>
              <RiskBadge bucket={building.risk_bucket} />
              <h1 style={page.heroAddress}>{building.address}</h1>
              <p style={page.heroMeta}>
                {building.borough_name}
                {building.stories ? ` · ${building.stories} stories` : ''}
                {building.management_program ? ` · ${building.management_program}` : ''}
              </p>
              <div style={page.heroStats}>
                <div>
                  <div style={{ ...page.heroStatN, color }}>{Math.round(building.percentile)}th</div>
                  <div style={page.heroStatLabel}>Percentile</div>
                </div>
                <div style={page.divider} />
                <div>
                  <div style={page.heroStatN}>{data.total}</div>
                  <div style={page.heroStatLabel}>Buildings in index</div>
                </div>
              </div>
            </div>
            <div style={page.heroRight}>
              <ScoreGauge score={building.risk_score} bucket={building.risk_bucket} />
              <p style={page.heroRiskLabel}>Risk Score</p>
            </div>
          </div>
        </section>

        {/* ── NYC DISTRIBUTION ──────────────────────────────────── */}
        <section style={page.section}>
          <div style={page.sectionHeader}>
            <h2 style={page.sectionTitle}>NYC-wide risk distribution</h2>
            <span style={page.sectionSub}>978 buildings</span>
          </div>
          <DistributionBar by_bucket={data.by_bucket} total={data.total} />
        </section>

        {/* ── BOROUGH MAP ───────────────────────────────────────── */}
        <section style={page.section}>
          <div style={page.sectionHeader}>
            <h2 style={page.sectionTitle}>Risk by borough</h2>
            <span style={page.sectionSub}>Average risk score</span>
          </div>
          <NYCBoroughMap rows={data.by_borough} />
        </section>

        {/* ── OWNERSHIP COMPARISON ──────────────────────────────── */}
        <section style={page.section}>
          <div style={page.sectionHeader}>
            <h2 style={page.sectionTitle}>Risk by ownership type</h2>
          </div>
          <OwnershipCard rows={ownershipRows} />
        </section>

        {/* ── TOP BUILDINGS ─────────────────────────────────────── */}
        <section style={page.section}>
          <div style={page.sectionHeader}>
            <h2 style={page.sectionTitle}>Highest-risk buildings</h2>
            <span style={page.sectionSub}>Top 20 by risk score</span>
          </div>
          <TopTable buildings={data.top_buildings} currentId={building.id} />
        </section>

        {/* ── SCORING EXPLAINER ─────────────────────────────────── */}
        <section style={page.section}>
          <div style={page.sectionHeader}>
            <h2 style={page.sectionTitle}>Risk scoring methodology</h2>
          </div>
          <ScoringExplainer building={building} />
        </section>

        <footer style={page.footer}>
          <p>Risk scores derived from HPD, DOB, and ECB violation data via NYC Open Data.</p>
          <p>Updated March 2026 · <a href="https://halfave.co" style={{ opacity: 0.6 }}>halfave.co</a></p>
        </footer>
      </main>
    </div>
  )
}

const page: Record<string, React.CSSProperties> = {
  root: { minHeight: '100dvh', background: 'var(--cream)' },
  header: {
    position: 'sticky', top: 0, zIndex: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 40px', background: 'rgba(247,244,239,0.92)',
    backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--navy-20)',
  },
  logo: { fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1rem' },
  emailTag: { fontFamily: 'var(--font-mono)', fontSize: '0.72rem', opacity: 0.4, letterSpacing: '0.02em' },
  reset: {
    fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
    padding: '6px 14px', border: '1px solid var(--navy-20)',
    borderRadius: 99, cursor: 'pointer', background: 'none', color: 'var(--navy)',
  },
  main: { maxWidth: 900, margin: '0 auto', padding: '0 24px 80px' },
  hero: {
    borderRadius: 'var(--radius-lg)', padding: '36px 40px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 32, flexWrap: 'wrap',
  },
  heroLeft: { flex: 1, display: 'flex', flexDirection: 'column', gap: 12 },
  heroAddress: {
    fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.4rem, 4vw, 2rem)',
    fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2,
  },
  heroMeta: { fontFamily: 'var(--font-mono)', fontSize: '0.72rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.08em' },
  heroStats: { display: 'flex', gap: 24, alignItems: 'center', marginTop: 8 },
  heroStatN: { fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 500, lineHeight: 1 },
  heroStatLabel: { fontFamily: 'var(--font-mono)', fontSize: '0.65rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 4 },
  divider: { width: 1, height: 36, background: 'rgba(247,244,239,0.15)' },
  heroRight: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  heroRiskLabel: { fontFamily: 'var(--font-mono)', fontSize: '0.65rem', opacity: 0.35, textTransform: 'uppercase', letterSpacing: '0.1em' },
  section: { marginTop: 40 },
  sectionHeader: { display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 },
  sectionTitle: { fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '-0.01em' },
  sectionSub: { fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.4 },
  footer: {
    marginTop: 60, paddingTop: 32, borderTop: '1px solid var(--navy-20)',
    fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.4,
    lineHeight: 2, textAlign: 'center',
  },
}
