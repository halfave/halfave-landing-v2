import React from 'react'

interface Props {
  onStart: () => void
}

export default function LandingPage({ onStart }: Props) {
  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <span style={styles.logo}>Half/Ave</span>
        <span style={styles.badge}>NYC Building Intelligence</span>
      </header>

      <main style={styles.main}>
        <div style={styles.eyebrow}>
          <span style={styles.dot} />
          Free Building Risk Report
        </div>

        <h1 style={styles.headline}>
          How safe is<br />
          <em>your building?</em>
        </h1>

        <p style={styles.sub}>
          We score every residential building in New York City on open violations,
          inspection history, and structural risk — so you can see exactly where
          your building stands before you sign a lease.
        </p>

        <div style={styles.stats}>
          {[
            { n: '978', label: 'Buildings scored' },
            { n: '5', label: 'Boroughs covered' },
            { n: '8,992', label: 'Violations analyzed' },
          ].map(({ n, label }) => (
            <div key={label} style={styles.stat}>
              <span style={styles.statN}>{n}</span>
              <span style={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>

        <button style={styles.cta} onClick={onStart}>
          Look up your building
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginLeft: 8 }}>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <p style={styles.note}>No account required · Free for renters</p>
      </main>

      <div style={styles.riskBar}>
        {[
          { label: 'Critical', pct: 0.7, color: '#c4533a' },
          { label: 'High Risk', pct: 2.8, color: '#d97b3a' },
          { label: 'Elevated', pct: 13.8, color: '#c9a227' },
          { label: 'Watch', pct: 24.0, color: '#7a8fa6' },
          { label: 'Healthy', pct: 58.7, color: '#3a7d5e' },
        ].map(({ label, pct, color }) => (
          <div key={label} style={{ ...styles.barSegment, width: `${pct}%`, backgroundColor: color }} title={`${label}: ${pct}%`} />
        ))}
      </div>

      <footer style={styles.footer}>
        <span style={styles.footerText}>Risk index across 978 NYC residential buildings · Updated March 2026</span>
      </footer>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100dvh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--navy)',
    color: 'var(--cream)',
    position: 'relative',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 40px',
    borderBottom: '1px solid rgba(247,244,239,0.08)',
  },
  logo: {
    fontFamily: 'var(--font-serif)',
    fontSize: '1.25rem',
    fontWeight: 600,
    letterSpacing: '-0.02em',
  },
  badge: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    opacity: 0.45,
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '80px 24px 60px',
    maxWidth: 640,
    margin: '0 auto',
    width: '100%',
  },
  eyebrow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: 'var(--font-mono)',
    fontSize: '0.72rem',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: '#c4533a',
    marginBottom: 24,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: '#c4533a',
    display: 'inline-block',
  },
  headline: {
    fontFamily: 'var(--font-serif)',
    fontSize: 'clamp(2.5rem, 7vw, 4.5rem)',
    fontWeight: 600,
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
    marginBottom: 28,
    color: 'var(--cream)',
  },
  sub: {
    fontSize: '1.05rem',
    lineHeight: 1.7,
    opacity: 0.7,
    marginBottom: 48,
    maxWidth: 480,
  },
  stats: {
    display: 'flex',
    gap: 48,
    marginBottom: 48,
    borderTop: '1px solid rgba(247,244,239,0.1)',
    borderBottom: '1px solid rgba(247,244,239,0.1)',
    padding: '24px 0',
    width: '100%',
    justifyContent: 'center',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  statN: {
    fontFamily: 'var(--font-mono)',
    fontSize: '1.6rem',
    fontWeight: 500,
    color: 'var(--cream)',
    letterSpacing: '-0.02em',
  },
  statLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.68rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    opacity: 0.45,
  },
  cta: {
    display: 'inline-flex',
    alignItems: 'center',
    backgroundColor: 'var(--cream)',
    color: 'var(--navy)',
    fontFamily: 'var(--font-serif)',
    fontWeight: 600,
    fontSize: '1rem',
    padding: '16px 32px',
    borderRadius: 'var(--radius)',
    marginBottom: 16,
    transition: 'opacity 0.15s',
    cursor: 'pointer',
  },
  note: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    opacity: 0.35,
    letterSpacing: '0.06em',
  },
  riskBar: {
    display: 'flex',
    height: 4,
    width: '100%',
  },
  barSegment: {
    height: '100%',
    transition: 'width 0.5s ease',
  },
  footer: {
    padding: '16px 40px',
    borderTop: '1px solid rgba(247,244,239,0.06)',
    textAlign: 'center',
  },
  footerText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.65rem',
    opacity: 0.3,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
}
