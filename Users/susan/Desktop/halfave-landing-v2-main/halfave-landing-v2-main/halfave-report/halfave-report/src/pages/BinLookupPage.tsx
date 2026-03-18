import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Building } from '../types'
import { BOROUGH_NAMES } from '../types'

interface Props {
  onFound: (building: Building) => void
  onBack: () => void
}

export default function BinLookupPage({ onFound, onBack }: Props) {
  const [bin, setBin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLookup() {
    const cleaned = bin.trim().replace(/\D/g, '')
    if (!cleaned || cleaned.length < 6) {
      setError('Please enter a valid BIN (7-digit building ID number)')
      return
    }
    setLoading(true)
    setError(null)

    const { data, error: err } = await supabase
      .schema('analytics')
      .from('buildings')
      .select(`
        id, address, slug, borough, stories, unit_count, management_program, bin,
        building_risk_scores (
          risk_score, risk_bucket, percentile, top_drivers
        )
      `)
      .eq('bin', Number(cleaned))
      .single()

    setLoading(false)

    if (err || !data) {
      setError('Building not found. Double-check the BIN or try searching by address at nyc.gov/buildings.')
      return
    }

    const score = Array.isArray(data.building_risk_scores)
      ? data.building_risk_scores[0]
      : data.building_risk_scores

    onFound({
      id: data.id,
      address: data.address,
      slug: data.slug,
      borough: data.borough,
      borough_name: BOROUGH_NAMES[data.borough] ?? 'NYC',
      stories: data.stories,
      story_band: storyBand(data.stories),
      unit_count: data.unit_count,
      management_program: data.management_program ?? 'PVT',
      risk_score: Number(score?.risk_score ?? 0),
      risk_bucket: score?.risk_bucket,
      percentile: Number(score?.percentile ?? 0),
      top_drivers: score?.top_drivers ?? null,
    } as Building)
  }

  function storyBand(s: number | null) {
    if (!s) return 'Unknown'
    if (s <= 3) return '1–3'
    if (s <= 6) return '4–6'
    if (s <= 12) return '7–12'
    return '13+'
  }

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <button style={styles.back} onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13 8H3M7 4L3 8l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Half/Ave
        </button>
      </header>

      <main style={styles.main}>
        <div style={styles.step}>Step 1 of 3</div>
        <h2 style={styles.title}>Enter your building's BIN</h2>
        <p style={styles.desc}>
          The Building Identification Number (BIN) is a unique 7-digit code assigned to every NYC building.
          Find yours at{' '}
          <a href="https://a810-bisweb.nyc.gov/bisweb/bispi00.jsp" target="_blank" rel="noreferrer" style={styles.link}>
            nyc.gov/buildings
          </a>
          , on your lease, or via a NYC property lookup.
        </p>

        <div style={styles.inputGroup}>
          <input
            style={styles.input}
            type="text"
            inputMode="numeric"
            placeholder="e.g. 1014190"
            value={bin}
            onChange={e => { setBin(e.target.value); setError(null) }}
            onKeyDown={e => e.key === 'Enter' && handleLookup()}
            maxLength={10}
            autoFocus
          />
          <button
            style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }}
            onClick={handleLookup}
            disabled={loading}
          >
            {loading ? 'Looking up…' : 'Look up building'}
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.hint}>
          <span style={styles.hintIcon}>💡</span>
          <span>Your building's BIN is printed on HPD inspection notices and DOB permits.</span>
        </div>
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: { minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: 'var(--cream)' },
  header: { padding: '24px 40px', borderBottom: '1px solid var(--navy-20)' },
  back: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1rem',
    color: 'var(--navy)', cursor: 'pointer', background: 'none', border: 'none',
  },
  main: {
    flex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '60px 24px', maxWidth: 540, margin: '0 auto', width: '100%',
  },
  step: {
    fontFamily: 'var(--font-mono)', fontSize: '0.7rem',
    textTransform: 'uppercase', letterSpacing: '0.1em',
    opacity: 0.4, marginBottom: 16,
  },
  title: {
    fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)',
    fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.2,
    marginBottom: 16, textAlign: 'center',
  },
  desc: {
    fontSize: '0.95rem', lineHeight: 1.7, opacity: 0.65,
    textAlign: 'center', marginBottom: 40, maxWidth: 420,
  },
  link: { color: 'var(--navy)', textDecoration: 'underline', textUnderlineOffset: 3 },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: 12, width: '100%', marginBottom: 12 },
  input: {
    width: '100%', padding: '16px 20px',
    fontFamily: 'var(--font-mono)', fontSize: '1.1rem', letterSpacing: '0.08em',
    border: '1.5px solid var(--navy-20)', borderRadius: 'var(--radius)',
    background: 'var(--white)', color: 'var(--navy)', outline: 'none',
  },
  btn: {
    width: '100%', padding: '16px 24px',
    background: 'var(--navy)', color: 'var(--cream)',
    fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: '1rem',
    borderRadius: 'var(--radius)', border: 'none', cursor: 'pointer',
    transition: 'opacity 0.15s',
  },
  error: {
    width: '100%', padding: '12px 16px',
    background: 'rgba(196,83,58,0.08)', border: '1px solid rgba(196,83,58,0.25)',
    borderRadius: 'var(--radius-sm)', color: 'var(--red)',
    fontFamily: 'var(--font-mono)', fontSize: '0.8rem', lineHeight: 1.5,
    marginBottom: 8,
  },
  hint: {
    display: 'flex', gap: 10, alignItems: 'flex-start',
    padding: '16px', background: 'var(--cream-80)', borderRadius: 'var(--radius)',
    fontFamily: 'var(--font-mono)', fontSize: '0.75rem', opacity: 0.6,
    lineHeight: 1.5, marginTop: 16, width: '100%',
  },
  hintIcon: { fontSize: '1rem', flexShrink: 0 },
}
