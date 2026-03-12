import React from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import type { Building, PivotRow } from '../types'
import { RISK_COLORS, RISK_ORDER } from '../types'
import { useRiskData } from '../hooks/useRiskData'

interface Props {
  building: Building
  email: string
  onReset: () => void
  onGoRisk?: () => void
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

// ─── Stacked pivot bar chart ──────────────────────────────────────────────────
function PivotChart({ rows, title }: { rows: PivotRow[]; title: string }) {
  const data = rows.map(r => ({
    ...r,
    // Recharts stacks in order — reverse so Healthy is at bottom
  }))

  return (
    <div style={chart.wrap}>
      <h3 style={chart.title}>{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 80, left: 0, bottom: 0 }}>
          <XAxis type="number" hide />
          <YAxis
            type="category" dataKey="label" width={110}
            tick={{ fontFamily: 'var(--font-mono)', fontSize: 11, fill: '#111e30' }}
            axisLine={false} tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(17,30,48,0.04)' }}
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div style={{
                  background: 'var(--navy)', color: 'var(--cream)',
                  padding: '10px 14px', borderRadius: 8,
                  fontFamily: 'var(--font-mono)', fontSize: '0.75rem', lineHeight: 1.8,
                }}>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
                  {[...payload].reverse().map((p: any) => (
                    <div key={p.name} style={{ color: RISK_COLORS[p.name as keyof typeof RISK_COLORS] ?? '#fff' }}>
                      {p.name}: {p.value}
                    </div>
                  ))}
                </div>
              )
            }}
          />
          {/* Healthy first (bottom of stack) → Critical on top */}
          {[...RISK_ORDER].reverse().map(bucket => (
            <Bar key={bucket} dataKey={bucket} stackId="a" fill={RISK_COLORS[bucket]} radius={bucket === 'Critical' ? [0,4,4,0] : undefined} />
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div style={chart.legend}>
        {RISK_ORDER.map(b => (
          <span key={b} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: RISK_COLORS[b], display: 'inline-block' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', opacity: 0.6 }}>{b}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

const chart: Record<string, React.CSSProperties> = {
  wrap: {
    background: 'var(--white)', borderRadius: 'var(--radius-lg)',
    padding: '24px 20px 20px', border: '1px solid var(--navy-20)',
  },
  title: {
    fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 600,
    marginBottom: 20, letterSpacing: '-0.01em',
  },
  legend: {
    display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 14,
    paddingTop: 14, borderTop: '1px solid var(--navy-20)',
  },
}

// ─── Score gauge ──────────────────────────────────────────────────────────────
function ScoreGauge({ score, bucket }: { score: number; bucket: string }) {
  const color = RISK_COLORS[bucket as keyof typeof RISK_COLORS] ?? '#7a8fa6'
  const pct = score / 100
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = circ * 0.75 // 270° arc
  const offset = dash * (1 - pct)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={140} height={100} viewBox="0 0 140 100">
        {/* Track */}
        <circle cx={70} cy={78} r={r} fill="none" stroke="rgba(17,30,48,0.08)"
          strokeWidth={10} strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={0} strokeLinecap="round"
          transform="rotate(-225 70 78)" />
        {/* Fill */}
        <circle cx={70} cy={78} r={r} fill="none" stroke={color}
          strokeWidth={10} strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={offset} strokeLinecap="round"
          transform="rotate(-225 70 78)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
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
  )
}

const tbl: Record<string, React.CSSProperties> = {
  wrap: {
    background: 'var(--white)', borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--navy-20)', overflow: 'hidden',
  },
  title: {
    fontFamily: 'var(--font-serif)', fontSize: '1rem', fontWeight: 600,
    padding: '22px 24px 18px', borderBottom: '1px solid var(--navy-20)',
  },
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
  you: {
    marginLeft: 8, fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
    color: 'var(--red)', opacity: 0.8,
  },
  mono: { fontFamily: 'var(--font-mono)', fontSize: '0.8rem' },
}

// ─── Distribution donut summary ───────────────────────────────────────────────
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
  wrap: {
    background: 'var(--white)', borderRadius: 'var(--radius-lg)',
    padding: '24px', border: '1px solid var(--navy-20)',
  },
  barWrap: { display: 'flex', height: 10, borderRadius: 99, overflow: 'hidden', marginBottom: 20 },
  seg: { height: '100%', transition: 'width 0.6s ease' },
  labels: { display: 'flex', gap: 20, flexWrap: 'wrap' },
  label: { display: 'flex', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 2, display: 'inline-block', flexShrink: 0 },
  bucketName: { fontFamily: 'var(--font-mono)', fontSize: '0.72rem', opacity: 0.6 },
  count: { fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 500, marginLeft: 2 },
}

// ─── Main report ──────────────────────────────────────────────────────────────
export default function ReportPage({ building, email, onReset, onGoRisk }: Props) {
  const { data, loading } = useRiskData()
  const color = RISK_COLORS[building.risk_bucket] ?? '#7a8fa6'

  if (loading || !data) {
    return (
      <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', opacity: 0.4 }}>Loading report…</div>
      </div>
    )
  }

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
        {/* Hero card */}
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
                <div style={{ ...page.heroStatN, color }}>
                  {Math.round(building.percentile)}th
                </div>
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

        {/* Section: Overall distribution */}
        <section style={page.section}>
          <div style={page.sectionHeader}>
            <h2 style={page.sectionTitle}>NYC-wide risk distribution</h2>
            <span style={page.sectionSub}>978 buildings</span>
          </div>
          <DistributionBar by_bucket={data.by_bucket} total={data.total} />
        </section>

        {/* Pivots */}
        <section style={page.section}>
          <div style={page.sectionHeader}>
            <h2 style={page.sectionTitle}>Risk by borough</h2>
          </div>
          <PivotChart rows={data.by_borough} title="Stacked count by risk level" />
        </section>

        <section style={page.section}>
          <div style={page.sectionHeader}>
            <h2 style={page.sectionTitle}>Risk by building size</h2>
            <span style={page.sectionSub}>Number of stories</span>
          </div>
          <PivotChart rows={data.by_story_band} title="Stacked count by stories band" />
        </section>

        <section style={page.section}>
          <div style={page.sectionHeader}>
            <h2 style={page.sectionTitle}>Risk by ownership type</h2>
            <span style={page.sectionSub}>Management program</span>
          </div>
          <PivotChart rows={data.by_mgmt} title="Stacked count by management program" />
        </section>

        {/* Top buildings */}
        <section style={page.section}>
          <div style={page.sectionHeader}>
            <h2 style={page.sectionTitle}>Highest-risk buildings</h2>
            <span style={page.sectionSub}>Top 20 by risk score</span>
          </div>
          <TopTable buildings={data.top_buildings} currentId={building.id} />
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
  emailTag: {
    fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
    opacity: 0.4, letterSpacing: '0.02em',
  },
  reset: {
    fontFamily: 'var(--font-mono)', fontSize: '0.72rem',
    padding: '6px 14px', border: '1px solid var(--navy-20)',
    borderRadius: 99, cursor: 'pointer', background: 'none', color: 'var(--navy)',
  },
  main: { maxWidth: 860, margin: '0 auto', padding: '0 24px 80px' },
  hero: {
    borderRadius: 'var(--radius-lg)', padding: '36px 40px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 32, marginTop: 40, marginBottom: 0,
    flexWrap: 'wrap',
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
