import React, { useState } from 'react'
import type { Building } from '../types'
import { RISK_COLORS } from '../types'
import { supabase } from '../lib/supabase'

interface Props {
  building: Building
  onUnlock: (email: string) => void
  onBack: () => void
}

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

    // Store lead in Supabase (fire-and-forget, don't block on error)
    try {
      await supabase.schema('analytics').from('report_leads').insert({
        email: trimmed,
        building_id: building.id,
        building_address: building.address,
        risk_bucket: building.risk_bucket,
        risk_score: building.risk_score,
      })
    } catch (_) {
      // table may not exist yet — still unlock
    }

    setLoading(false)
    onUnlock(trimmed)
  }

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <button style={styles.back} onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <span style={styles.logo}>Half/Ave</span>
      </header>

      <main style={styles.main}>
        <div style={styles.step}>Step 2 of 3</div>

        {/* Building preview card */}
        <div style={styles.buildingCard}>
          <div style={styles.cardLeft}>
            <div style={styles.cardAddress}>{building.address}</div>
            <div style={styles.cardMeta}>
              {building.borough_name}
              {building.stories ? ` · ${building.stories} stories` : ''}
              {building.management_program ? ` · ${building.management_program}` : ''}
            </div>
          </div>
          <div style={styles.cardRight}>
            <div style={{ ...styles.scoreCircle, borderColor: bucketColor }}>
              <span style={{ ...styles.scoreNum, color: bucketColor }}>{score}</span>
              <span style={styles.scoreLabel}>/ 100</span>
            </div>
            <div style={{ ...styles.bucket, color: bucketColor, borderColor: bucketColor }}>
              {building.risk_bucket}
            </div>
          </div>
        </div>

        <div style={styles.blurHint}>
          <div style={{ ...styles.blurLine, width: '100%' }} />
          <div style={{ ...styles.blurLine, width: '70%' }} />
          <div style={{ ...styles.blurLine, width: '85%' }} />
          <span style={styles.lockLabel}>Full report locked</span>
        </div>

        <h2 style={styles.title}>Unlock the full report</h2>
        <p style={styles.desc}>
          Enter your email to see the complete risk breakdown — violation history, driver analysis, and how <em>{building.address}</em> compares across NYC.
        </p>

        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => { setEmail(e.target.value); setError(null) }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />
          <button
            style={{ ...styles.btn, opacity: loading ? 0.65 : 1 }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Unlocking…' : 'View full report →'}
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <p style={styles.privacy}>
          No spam. No account. We'll only send building alerts if your score changes.
        </p>
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: { minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--cream)' },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '24px 40px', borderBottom: '1px solid var(--navy-20)',
  },
  back: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    fontFamily: 'var(--font-serif)', fontSize: '0.9rem',
    color: 'var(--navy)', opacity: 0.6, cursor: 'pointer', background: 'none', border: 'none',
  },
  logo: { fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1rem' },
  main: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '60px 24px',
    maxWidth: 520, margin: '0 auto', width: '100%',
  },
  step: {
    fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
    textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.4, marginBottom: 24,
  },
  buildingCard: {
    width: '100%', padding: '20px 24px',
    background: 'var(--navy)', color: 'var(--cream)',
    borderRadius: 'var(--radius-lg)', marginBottom: 20,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
  },
  cardLeft: { flex: 1 },
  cardAddress: { fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1.05rem', marginBottom: 6 },
  cardMeta: { fontFamily: 'var(--font-mono)', fontSize: '0.7rem', opacity: 0.45, textTransform: 'uppercase', letterSpacing: '0.08em' },
  cardRight: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  scoreCircle: {
    width: 60, height: 60, borderRadius: '50%',
    border: '2px solid', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
  },
  scoreNum: { fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 500, lineHeight: 1 },
  scoreLabel: { fontFamily: 'var(--font-mono)', fontSize: '0.55rem', opacity: 0.5, lineHeight: 1, marginTop: 2 },
  bucket: {
    fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    border: '1px solid', borderRadius: 99, padding: '2px 8px',
  },
  blurHint: {
    width: '100%', padding: '16px 20px',
    background: 'rgba(17,30,48,0.04)', borderRadius: 'var(--radius)',
    marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 10,
    alignItems: 'flex-start', position: 'relative',
  },
  blurLine: {
    height: 10, width: '100%', borderRadius: 4,
    background: 'linear-gradient(90deg, var(--navy-20) 0%, transparent 100%)',
    filter: 'blur(2px)',
  },
  lockLabel: {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)',
    fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    opacity: 0.45, whiteSpace: 'nowrap',
  },
  title: {
    fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 5vw, 2.4rem)',
    fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2,
    marginBottom: 14, textAlign: 'center',
  },
  desc: {
    fontSize: '0.95rem', lineHeight: 1.7, opacity: 0.65,
    textAlign: 'center', marginBottom: 36, maxWidth: 400,
  },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: 10, width: '100%', marginBottom: 10 },
  input: {
    width: '100%', padding: '15px 18px',
    fontFamily: 'var(--font-mono)', fontSize: '0.95rem',
    border: '1.5px solid var(--navy-20)', borderRadius: 'var(--radius)',
    background: 'var(--white)', color: 'var(--navy)', outline: 'none',
  },
  btn: {
    width: '100%', padding: '15px 24px',
    background: 'var(--navy)', color: 'var(--cream)',
    fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1rem',
    borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer',
  },
  error: {
    width: '100%', padding: '10px 14px',
    background: 'rgba(196,83,58,0.08)', border: '1px solid rgba(196,83,58,0.25)',
    borderRadius: 'var(--radius-sm)', color: 'var(--red)',
    fontFamily: 'var(--font-mono)', fontSize: '0.78rem', marginBottom: 8,
  },
  privacy: {
    fontFamily: 'var(--font-mono)', fontSize: '0.68rem',
    opacity: 0.35, textAlign: 'center', marginTop: 8, letterSpacing: '0.04em',
  },
}
