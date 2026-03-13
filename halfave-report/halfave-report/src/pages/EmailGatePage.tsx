import React, { useState } from 'react'
import type { Building } from '../types'
import { RISK_COLORS } from '../types'
import { supabase } from '../lib/supabase'

interface Props {
  building: Building
  onUnlock: (email: string) => void
  onBack: () => void
}

const LOGO = 'https://pub-8148357eae8a439fa3a35df4c60df703.r2.dev/site/logo/halfspacelogo.png'

const MOCK_VIOLATIONS = [
  { cls: 'C', title: 'Elevator — no annual inspection certificate', meta: 'NOV-123845 · Issued 01/14/2025 · ECB', open: true },
  { cls: 'C', title: 'Rodent infestation — evidence throughout building', meta: 'NOV-118302 · Issued 11/03/2024 · HPD', open: true },
  { cls: 'B', title: 'No hot water supply in unit 4B', meta: 'NOV-117441 · Issued 10/19/2024 · HPD', open: true },
  { cls: 'B', title: 'Peeling paint — lead paint hazard, unit 7A', meta: 'NOV-116889 · Issued 09/30/2024 · HPD', open: true },
  { cls: 'B', title: 'Defective window guard — unit 12C', meta: 'NOV-114203 · Issued 07/08/2024 · HPD', open: false },
]

export default function EmailGatePage({ building, onUnlock, onBack }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [logoErr, setLogoErr] = useState(false)

  const bucketColor = RISK_COLORS[building.risk_bucket] ?? '#7a8fa6'
  const score = Math.round(building.risk_score)
  const addr = building.address || 'this building'

  async function handleSubmit() {
    const trimmed = email.trim().toLowerCase()
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Please enter a valid email address')
      return
    }
    setLoading(true)
    setError(null)
    try {
      await supabase.schema('analytics').from('report_leads').insert({
        email: trimmed,
        building_id: building.id,
        building_address: building.address,
        risk_bucket: building.risk_bucket,
        risk_score: building.risk_score,
        bin: building.bin ? String(building.bin) : null,
        percentile: building.percentile ?? null,
      })
    } catch (_) {}

    // Fire report email via Edge Function (non-blocking)
    fetch('https://mjkkzniagexfooclqsjr.supabase.co/functions/v1/send-report-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: trimmed,
        building_address: building.address,
        risk_score: building.risk_score,
        percentile: building.percentile ?? null,
        risk_bucket: building.risk_bucket,
        bin: building.bin ? String(building.bin) : null,
      }),
    }).catch(err => console.warn('Email send failed:', err))

    setLoading(false)
    onUnlock(trimmed)
  }

  return (
    <div style={s.root}>
      <header style={s.hdr}>
        <button style={s.back} onClick={onBack}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        {logoErr
          ? <span style={s.logoFallback}>Half/Ave</span>
          : <img src={LOGO} alt="Half/Ave" style={s.logo} onError={() => setLogoErr(true)} />
        }
      </header>

      <div style={s.body}>

        {/* Score */}
        <div style={s.scoreBlock}>
          <div style={s.scoreEyebrow}>Building Risk Score</div>
          <div style={{ ...s.scoreNum, color: bucketColor }}>{score}</div>
          <div style={s.scorePct}>Higher risk than {building.percentile ?? '—'}% of NYC buildings</div>
        </div>

        {/* Blurred report preview */}
        <div style={s.blurredWrap}>
          {/* Real-looking violation rows behind the fade */}
          <div style={s.reportBg}>
            <div style={s.tabs}>
              {['All Agencies','HPD','DOB','ECB','DSNY'].map((t, i) => (
                <div key={t} style={{ ...s.tab, ...(i === 0 ? s.tabActive : {}) }}>{t}</div>
              ))}
            </div>
            <div style={s.viols}>
              {MOCK_VIOLATIONS.map((v, i) => (
                <div key={i} style={s.vrow}>
                  <span style={{ ...s.badge, ...(v.cls === 'C' ? s.badgeC : s.badgeB) }}>Class {v.cls}</span>
                  <div style={s.vinfo}>
                    <div style={s.vtitle}>{v.title}</div>
                    <div style={s.vmeta}>{v.meta}</div>
                  </div>
                  <div style={{ ...s.vstatus, ...(v.open ? {} : s.vstatusClosed) }}>
                    {v.open ? 'OPEN' : 'CLOSED'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gradient overlay + CTA copy */}
          <div style={s.overlay}>
            <div style={s.lockTitle}>See what's driving your risk score</div>
            <ul style={s.bullets}>
              <li style={s.bullet}><span style={s.bulletDot}>•</span>Every violation and penalty tied to this property</li>
              <li style={s.bullet}><span style={s.bulletDot}>•</span>What to fix, what to fight, and what to ignore</li>
              <li style={s.bullet}><span style={s.bulletDot}>•</span>Inspections and filings due soon</li>
              <li style={s.bullet}><span style={s.bulletDot}>•</span>How {addr} ranks vs similar NYC properties</li>
            </ul>
          </div>
        </div>

        {/* Input + CTA */}
        <div style={s.bottom}>
          <input
            style={s.emailIn}
            type="email"
            placeholder="john.smith@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(null) }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          <button
            style={{ ...s.ctaBtn, opacity: loading ? 0.65 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Unlocking…' : 'Show Full Report →'}
          </button>
          {error && <div style={s.error}>{error}</div>}
          <p style={s.privacy}>
            No spam. No account required. We'll send this report and alert you if the building's risk score changes.
          </p>
        </div>

      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100dvh', display: 'flex', flexDirection: 'column',
    background: 'var(--cream)', alignItems: 'center',
  },
  hdr: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '13px 22px', borderBottom: '1px solid rgba(17,30,48,0.09)',
    flexShrink: 0, width: '100%', maxWidth: 480,
  },
  back: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: '12px', color: 'rgba(17,30,48,0.45)',
    background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
  },
  logo: { height: 42, width: 'auto', display: 'block' },
  logoFallback: { fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 15, color: 'var(--navy)' },

  body: {
    flex: 1, display: 'flex', flexDirection: 'column',
    padding: '14px 22px 10px', width: '100%', maxWidth: 480,
    height: '80vh', maxHeight: 820, overflow: 'hidden',
  },

  scoreBlock: { textAlign: 'center', flexShrink: 0, paddingBottom: 12 },
  scoreEyebrow: {
    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.13em',
    textTransform: 'uppercase', color: 'rgba(17,30,48,0.4)', marginBottom: 2,
  },
  scoreNum: { fontFamily: 'var(--font-mono)', fontSize: 54, fontWeight: 500, lineHeight: 1, padding: '10px 0' },
  scorePct: { fontSize: 11, color: 'rgba(17,30,48,0.48)', marginTop: 4 },

  blurredWrap: {
    flex: 0.8, position: 'relative', borderRadius: 12,
    border: '1px solid rgba(17,30,48,0.1)', overflow: 'hidden',
    minHeight: 0, background: '#fff',
  },
  reportBg: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column' },

  tabs: {
    display: 'flex', borderBottom: '1px solid rgba(17,30,48,0.08)',
    flexShrink: 0, padding: '0 14px', background: '#fff',
  },
  tab: {
    fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
    textTransform: 'uppercase', padding: '9px 11px 8px',
    color: 'rgba(17,30,48,0.32)', borderBottom: '2px solid transparent', whiteSpace: 'nowrap',
  },
  tabActive: { color: '#111e30', borderBottom: '2px solid #111e30' },

  viols: {
    flex: 1, overflow: 'hidden', padding: '10px 12px',
    display: 'flex', flexDirection: 'column', gap: 5, background: '#fff',
  },
  vrow: {
    display: 'flex', alignItems: 'flex-start', gap: 9,
    padding: '7px 9px', borderRadius: 7,
    border: '1px solid rgba(17,30,48,0.07)', background: '#fafaf8', flexShrink: 0,
  },
  badge: {
    fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 700,
    padding: '2px 5px', borderRadius: 4, flexShrink: 0, marginTop: 1, letterSpacing: '0.03em',
  },
  badgeC: { background: '#fde8e4', color: '#c4533a' },
  badgeB: { background: '#fef3e2', color: '#b45309' },
  vinfo: { flex: 1, minWidth: 0 },
  vtitle: { fontSize: 10, fontWeight: 600, color: '#111e30', marginBottom: 2, lineHeight: 1.3 },
  vmeta: { fontFamily: 'var(--font-mono)', fontSize: 8.5, color: 'rgba(17,30,48,0.38)' },
  vstatus: { fontFamily: 'var(--font-mono)', fontSize: 8.5, fontWeight: 700, flexShrink: 0, marginTop: 1, color: '#c4533a' },
  vstatusClosed: { color: '#3a7d5e' },

  overlay: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(to bottom, rgba(247,244,239,0) 0%, rgba(247,244,239,0) 8%, rgba(247,244,239,0.5) 22%, rgba(247,244,239,0.92) 38%, rgba(247,244,239,1) 52%, rgba(247,244,239,1) 100%)',
    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
    padding: '16px 18px 20px', gap: 9,
  },
  lockTitle: { fontSize: 13, fontWeight: 600, color: '#111e30', textAlign: 'left', lineHeight: 1.4 },
  bullets: { listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 },
  bullet: { fontSize: 11, color: 'rgba(17,30,48,0.62)', display: 'flex', alignItems: 'flex-start', gap: 7, lineHeight: 1.4 },
  bulletDot: { color: '#c4533a', flexShrink: 0, fontWeight: 700 },

  bottom: { flexShrink: 0, paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 7 },
  emailIn: {
    width: '100%', padding: '10px 13px',
    fontFamily: 'var(--font-mono)', fontSize: 13,
    border: '1px solid rgba(17,30,48,0.16)', borderRadius: 8,
    background: '#fff', color: '#111e30', outline: 'none', boxSizing: 'border-box',
  },
  ctaBtn: {
    width: '100%', padding: 12, background: '#111e30', color: '#f7f4ef',
    fontFamily: 'var(--font-serif)', fontSize: 14, fontWeight: 600,
    border: 'none', borderRadius: 8, cursor: 'pointer',
  },
  error: {
    padding: '8px 12px', background: 'rgba(196,83,58,0.08)',
    border: '1px solid rgba(196,83,58,0.25)', borderRadius: 6,
    color: '#c4533a', fontFamily: 'var(--font-mono)', fontSize: 11,
  },
  privacy: {
    fontFamily: 'var(--font-mono)', fontSize: 9.5,
    color: 'rgba(17,30,48,0.35)', textAlign: 'center', lineHeight: 1.6,
  },
}
