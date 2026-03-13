import React, { useState } from 'react'
import type { Building } from '../types'
import { RISK_COLORS } from '../types'
import { supabase } from '../lib/supabase'

interface Props {
  building: Building
  onUnlock: (email: string) => void
  onBack: () => void
}

const LOCKED_SECTIONS = [
  'Violation Breakdown',
  'Inspection Timeline',
  'Compliance Signals',
  'Peer Comparison',
  'Risk Drivers',
]

export default function EmailGatePage({ building, onUnlock, onBack }: Props) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const bucketColor = RISK_COLORS[building.risk_bucket] ?? '#7a8fa6'
  const score = Math.round(building.risk_score)

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
      })
    } catch (_) {}

    setLoading(false)
    onUnlock(trimmed)
  }

  return (
    <div style={s.root}>
      <header style={s.header}>
        <button style={s.back} onClick={onBack}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <span style={s.logo}>Half/Ave</span>
      </header>

      <main style={s.main}>

        {/* Building card */}
        <div style={s.buildingCard}>
          <div style={s.cardLeft}>
            <div style={s.cardAddress}>{building.address}</div>
            <div style={s.cardMeta}>
              {building.borough_name}
              {building.stories ? ` · ${building.stories} stories` : ''}
            </div>
          </div>
          <div style={s.cardRight}>
            <div style={{ ...s.scoreCircle, borderColor: bucketColor }}>
              <span style={{ ...s.scoreNum, color: bucketColor }}>{score}</span>
              <span style={s.scoreLabel}>/ 100</span>
            </div>
            <div style={{ ...s.bucket, color: bucketColor, borderColor: bucketColor }}>
              {building.risk_bucket}
            </div>
          </div>
        </div>

        {/* Blurred locked sections */}
        <div style={s.lockedBlock}>
          {LOCKED_SECTIONS.map(section => (
            <div key={section} style={s.lockedRow}>
              <div style={s.lockedLeft}>
                <span style={s.lockIcon}>🔒</span>
                <span style={s.lockedTitle}>{section}</span>
              </div>
              <div style={s.blurBars}>
                <div style={{ ...s.blurBar, width: 72 }} />
                <div style={{ ...s.blurBar, width: 48 }} />
                <div style={{ ...s.blurBar, width: 88 }} />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={s.cta}>
          <h2 style={s.title}>Unlock the full report to see:</h2>
          <ul style={s.bullets}>
            <li>Every violation and penalty tied to this building</li>
            <li>What to fix, what to fight, and what to ignore</li>
            <li>Where this building ranks vs similar NYC properties</li>
            <li>Upcoming compliance deadlines</li>
          </ul>

          <div style={s.inputGroup}>
            <input
              style={s.input}
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(null) }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
            <button
              style={{ ...s.btn, opacity: loading ? 0.65 : 1 }}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Unlocking…' : 'Reveal Full Building Report →'}
            </button>
          </div>

          {error && <div style={s.error}>{error}</div>}

          <p style={s.privacy}>
            No spam. No account required. We'll send this report and notify you if the building's risk score changes.
          </p>
        </div>

      </main>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  root: { minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--cream)' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 28px', borderBottom: '1px solid var(--navy-20)',
  },
  back: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontFamily: 'var(--font-serif)', fontSize: '0.82rem',
    color: 'var(--navy)', opacity: 0.6, cursor: 'pointer', background: 'none', border: 'none',
  },
  logo: { fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '0.9rem' },
  main: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '24px 20px',
    maxWidth: 520, margin: '0 auto', width: '100%',
  },

  // Building card
  buildingCard: {
    width: '100%', padding: '14px 18px',
    background: 'var(--navy)', color: 'var(--cream)',
    borderRadius: 'var(--radius-lg)', marginBottom: 12,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
  },
  cardLeft: { flex: 1 },
  cardAddress: { fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '0.95rem', marginBottom: 4 },
  cardMeta: { fontFamily: 'var(--font-mono)', fontSize: '0.65rem', opacity: 0.45, textTransform: 'uppercase', letterSpacing: '0.08em' },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 },
  scoreCircle: {
    width: 50, height: 50, borderRadius: '50%',
    border: '2px solid', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
  },
  scoreNum: { fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 500, lineHeight: 1 },
  scoreLabel: { fontFamily: 'var(--font-mono)', fontSize: '0.5rem', opacity: 0.5, lineHeight: 1, marginTop: 2 },
  bucket: {
    fontFamily: 'var(--font-mono)', fontSize: '0.6rem',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    border: '1px solid', borderRadius: 99, padding: '2px 7px',
  },

  // Locked sections
  lockedBlock: {
    width: '100%', background: '#111e30', borderRadius: 'var(--radius-lg)',
    overflow: 'hidden', marginBottom: 16,
  },
  lockedRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  lockedLeft: { display: 'flex', alignItems: 'center', gap: 8 },
  lockIcon: { fontSize: 11, opacity: 0.4 },
  lockedTitle: { fontSize: '0.8rem', color: 'rgba(247,244,239,0.6)', fontFamily: 'var(--font-sans)' },
  blurBars: { display: 'flex', gap: 4, alignItems: 'center' },
  blurBar: { height: 7, borderRadius: 3, background: 'rgba(247,244,239,0.15)', filter: 'blur(3px)' },

  // CTA area
  cta: { width: '100%' },
  title: {
    fontFamily: 'var(--font-serif)', fontSize: '1.25rem',
    fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.3,
    marginBottom: 10, color: 'var(--navy)',
  },
  bullets: {
    paddingLeft: '1.1rem', marginBottom: 18,
    display: 'flex', flexDirection: 'column', gap: 5,
    fontSize: '0.82rem', lineHeight: 1.5, opacity: 0.7, color: 'var(--navy)',
  },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: 8, width: '100%', marginBottom: 8 },
  input: {
    width: '100%', padding: '12px 16px',
    fontFamily: 'var(--font-mono)', fontSize: '0.9rem',
    border: '1.5px solid var(--navy-20)', borderRadius: 'var(--radius)',
    background: 'var(--white)', color: 'var(--navy)', outline: 'none',
    boxSizing: 'border-box',
  },
  btn: {
    width: '100%', padding: '13px 24px',
    background: 'var(--navy)', color: 'var(--cream)',
    fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '0.95rem',
    borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer',
  },
  error: {
    width: '100%', padding: '9px 12px',
    background: 'rgba(196,83,58,0.08)', border: '1px solid rgba(196,83,58,0.25)',
    borderRadius: 'var(--radius-sm)', color: 'var(--red)',
    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', marginBottom: 6,
  },
  privacy: {
    fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
    opacity: 0.35, textAlign: 'center', marginTop: 8, letterSpacing: '0.03em', lineHeight: 1.6,
  },
}
