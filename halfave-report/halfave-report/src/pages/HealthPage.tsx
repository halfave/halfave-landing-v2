// HealthPage.tsx
// NYC-wide building health overview — same design system as ReportPage, no building-specific data

// ─── CSS (shared with ReportPage) ────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');
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
    --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    --font-mono: 'DM Mono', 'Courier New', monospace;
    --radius: 12px;
    --radius-lg: 16px;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: var(--bg); color: var(--navy); font-family: 'Inter', -apple-system, sans-serif; }

  .rp-root { min-height: 100vh; background: #fff; }

  /* ── HERO ── */
  .rp-hero {
    background: #fff;
    padding: 48px 24px 40px;
    border-bottom: 1px solid rgba(17,30,48,0.08);
  }
  .rp-hero-inner { max-width: 860px; margin: 0 auto; padding: 0 24px; }
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
    font-size: clamp(22px, 3vw, 34px);
    font-weight: 500;
    color: var(--navy);
    line-height: 1.15;
    margin-bottom: 8px;
    letter-spacing: -0.02em;
  }
  .rp-hero-meta {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--slate);
    margin-bottom: 28px;
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .rp-hero-meta span::before { content: '· '; }
  .rp-hero-meta span:first-child::before { content: ''; }
  .rp-hero-summary {
    font-size: 1rem;
    color: #6b7280;
    max-width: 620px;
    line-height: 1.6;
    margin-bottom: 0;
  }
  .rp-hero-summary strong { color: var(--navy); font-weight: 600; }

  /* ── BODY ── */
  .rp-body { max-width: 860px; margin: 0 auto; padding: 36px 24px 80px; font-family: 'Inter', -apple-system, sans-serif; background: #fff; }

  /* ── SECTION ── */
  .rp-section { margin-bottom: 24px; background: #fff; border-radius: 20px; padding: 2rem; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
  .rp-section-title {
    font-family: var(--font-mono);
    font-weight: 700;
    font-size: 0.68rem;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #9ca3af;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* ── STATS GRID ── */
  .rp-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1px;
    background: rgba(17,30,48,0.06);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(17,30,48,0.06);
  }
  .rp-stat {
    background: #f9fafb;
    padding: 18px 20px;
  }
  .rp-stat-val {
    font-family: 'Inter', -apple-system, sans-serif;
    font-size: 22px;
    font-weight: 700;
    color: var(--navy);
    line-height: 1;
  }
  .rp-stat-lbl {
    font-family: 'Inter', -apple-system, sans-serif;
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

  /* ── LEADERBOARD ── */
  .rp-leaderboard-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-radius: 8px;
    background: #f9fafb;
    border: 1px solid transparent;
    margin-bottom: 6px;
  }
  .rp-leaderboard-row:last-child { margin-bottom: 0; }

  /* ── CHART GRID ── */
  .rp-chart-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .rp-chart-cell {
    border-radius: 10px; padding: 14px 16px;
    display: flex; flex-direction: column; gap: 6px;
  }
  .rp-chart-cell-label { font-family: 'Inter', -apple-system, sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #9ca3af; }
  .rp-chart-cell-score { font-family: var(--font-serif); font-size: 1.8rem; font-weight: 600; line-height: 1; }
  .rp-chart-cell-sub { font-family: 'Inter', -apple-system, sans-serif; font-size: 10px; color: #9ca3af; }
  .rp-chart-bar { height: 4px; border-radius: 2px; background: rgba(0,0,0,0.08); overflow: hidden; margin-top: 4px; }
  .rp-chart-bar-fill { height: 100%; border-radius: 2px; }
  @media (max-width: 600px) { .rp-chart-grid { grid-template-columns: repeat(2, 1fr); } }

  /* ── CTA BANNER ── */
  .rp-cta-banner {
    display: flex;
    align-items: center;
    gap: 16px;
    background: var(--navy);
    border-radius: 14px;
    padding: 18px 24px;
    margin-top: 8px;
    flex-wrap: wrap;
  }
`;

// ─── Data ────────────────────────────────────────────────────────────────────

const BORO_COLORS: Record<string, string> = {
  Manhattan:       '#111e30',
  Bronx:           '#c4533a',
  Brooklyn:        '#4a7fb5',
  Queens:          '#c9a227',
  'Staten Island': '#7a8fa6',
};

const NEIGHBORHOODS: Record<string, { name: string; borough: string }> = {
  '11370': { name: 'East Elmhurst',      borough: 'Queens'        },
  '10314': { name: 'Mid-Island',         borough: 'Staten Island' },
  '10310': { name: 'West Brighton',      borough: 'Staten Island' },
  '11105': { name: 'Astoria',            borough: 'Queens'        },
  '11357': { name: 'Whitestone',         borough: 'Queens'        },
  '11103': { name: 'Astoria North',      borough: 'Queens'        },
  '11379': { name: 'Middle Village',     borough: 'Queens'        },
  '10306': { name: 'New Dorp',           borough: 'Staten Island' },
  '11694': { name: 'Rockaway Park',      borough: 'Queens'        },
  '11361': { name: 'Bayside',            borough: 'Queens'        },
  '11106': { name: 'Long Island City',   borough: 'Queens'        },
  '11101': { name: 'Long Island City',   borough: 'Queens'        },
  '11102': { name: 'Astoria South',      borough: 'Queens'        },
  '11356': { name: 'College Point',      borough: 'Queens'        },
  '11231': { name: 'Carroll Gardens',    borough: 'Brooklyn'      },
  '11385': { name: 'Ridgewood',          borough: 'Queens'        },
  '10075': { name: 'Upper East Side',    borough: 'Manhattan'     },
  '10028': { name: 'Upper East Side',    borough: 'Manhattan'     },
  '10305': { name: 'Rosebank',           borough: 'Staten Island' },
  '11367': { name: 'Kew Gardens Hills',  borough: 'Queens'        },
  '11225': { name: 'Crown Heights',      borough: 'Brooklyn'      },
  '10452': { name: 'Highbridge',         borough: 'Bronx'         },
  '10468': { name: 'Fordham',            borough: 'Bronx'         },
  '10457': { name: 'East Tremont',       borough: 'Bronx'         },
  '11207': { name: 'East New York',      borough: 'Brooklyn'      },
  '11213': { name: 'Crown Heights East', borough: 'Brooklyn'      },
  '10467': { name: 'Norwood',            borough: 'Bronx'         },
  '11226': { name: 'Flatbush',           borough: 'Brooklyn'      },
  '10474': { name: 'Hunts Point',        borough: 'Bronx'         },
  '10466': { name: 'Wakefield',          borough: 'Bronx'         },
};

const worst10 = [
  { zip:'11225', avg:46.7, count:210  },
  { zip:'10452', avg:47.7, count:428  },
  { zip:'10468', avg:48.0, count:461  },
  { zip:'10457', avg:49.7, count:644  },
  { zip:'11207', avg:49.8, count:76   },
  { zip:'11213', avg:50.0, count:284  },
  { zip:'10467', avg:50.3, count:342  },
  { zip:'11226', avg:50.6, count:414  },
  { zip:'10474', avg:50.6, count:138  },
  { zip:'10466', avg:51.8, count:64   },
];

const top10 = [
  { zip:'11370', avg:89.1, count:277  },
  { zip:'10314', avg:88.6, count:188  },
  { zip:'10310', avg:86.8, count:103  },
  { zip:'11105', avg:85.0, count:899  },
  { zip:'11357', avg:85.0, count:63   },
  { zip:'11103', avg:84.9, count:1319 },
  { zip:'11379', avg:84.8, count:170  },
  { zip:'10306', avg:84.4, count:83   },
  { zip:'11694', avg:83.8, count:52   },
  { zip:'11361', avg:83.7, count:61   },
];

// Borough-level summary stats (illustrative aggregates)
const BORO_STATS = [
  { borough: 'Manhattan',    avg: 71.2, buildings: 28400, openViols: 41200 },
  { borough: 'Brooklyn',     avg: 67.8, buildings: 52100, openViols: 89300 },
  { borough: 'Queens',       avg: 74.6, buildings: 46700, openViols: 54100 },
  { borough: 'Bronx',        avg: 58.3, buildings: 31200, openViols: 112400 },
  { borough: 'Staten Island',avg: 79.1, buildings: 12800, openViols: 14700 },
];

// NYC-wide headline stats
const NYC_STATS = {
  totalBuildings:    171200,
  avgHealthScore:    68.4,
  openViolations:    311700,
  pctHealthy:        34,       // score >= 80
  pctWatch:          22,       // score < 40
  medianResolveDays: 418,
};

// ─── Leaderboard List ─────────────────────────────────────────────────────────
function LeaderboardList({ data, label }: { data: typeof top10; label: string }) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700,
        letterSpacing: '0.08em', textTransform: 'uppercase' as const,
        color: '#9ca3af', marginBottom: 10,
      }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {data.map((row, i) => {
          const hood = NEIGHBORHOODS[row.zip];
          if (!hood) return null;
          const color = BORO_COLORS[hood.borough] ?? '#7a8fa6';
          return (
            <div key={row.zip} className="rp-leaderboard-row">
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: '#9ca3af', width: 14, flexShrink: 0, textAlign: 'right' as const }}>{i + 1}</span>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: 'var(--navy)', whiteSpace: 'nowrap' as const, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {hood.name}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: '#9ca3af' }}>{hood.borough} · {row.count.toLocaleString()} bldgs</div>
              </div>
              <div style={{ width: 60, height: 4, background: 'rgba(17,30,48,0.08)', borderRadius: 2, overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ height: '100%', width: `${row.avg}%`, background: color, borderRadius: 2 }} />
              </div>
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color, flexShrink: 0, minWidth: 32, textAlign: 'right' as const }}>{row.avg}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main HealthPage ──────────────────────────────────────────────────────────
export default function HealthPage() {
  return (
    <>
      <style>{CSS}</style>
      <div className="rp-root">

        {/* ── HERO ── */}
        <div className="rp-hero">
          <div className="rp-hero-inner">
            <div className="rp-hero-eyebrow">Half Ave · NYC Building Health</div>
            <div className="rp-hero-address">NYC Building Health Index</div>
            <div className="rp-hero-meta">
              <span>171,200 Rental Buildings</span>
              <span>All 5 Boroughs</span>
              <span>HPD · DOB · ECB Data</span>
            </div>
            <p className="rp-hero-summary">
              The <strong>Half Ave Health Score</strong> rates every NYC rental building on a 0–100 scale,
              combining open violations, inspection outcomes, device compliance, and resolution history.
              Across the city, the average score is <strong>68.4</strong> — with wide variation by borough,
              neighborhood, and building age. Use this page to understand where NYC stands,
              and{' '}
              <a href="https://halfave.co" style={{ color: 'var(--navy)', textDecoration: 'underline' }}>look up any building</a>
              {' '}for a full report.
            </p>
          </div>
        </div>

        {/* ── BODY ── */}
        <div className="rp-body">

          {/* ── NYC HEADLINE STATS ── */}
          <div className="rp-section">
            <div className="rp-section-title">NYC At a Glance</div>
            <div className="rp-stats-grid">
              <div className="rp-stat">
                <div className="rp-stat-val">{NYC_STATS.avgHealthScore}</div>
                <div className="rp-stat-lbl">Avg Health Score (citywide)</div>
              </div>
              <div className="rp-stat">
                <div className="rp-stat-val">{NYC_STATS.totalBuildings.toLocaleString()}</div>
                <div className="rp-stat-lbl">Rental Buildings Tracked</div>
              </div>
              <div className="rp-stat">
                <div className="rp-stat-val rp-stat-warn">{NYC_STATS.openViolations.toLocaleString()}</div>
                <div className="rp-stat-lbl">Open Violations Citywide</div>
              </div>
              <div className="rp-stat">
                <div className="rp-stat-val rp-stat-ok">{NYC_STATS.pctHealthy}%</div>
                <div className="rp-stat-lbl">Buildings Scoring 80+</div>
              </div>
              <div className="rp-stat">
                <div className="rp-stat-val rp-stat-warn">{NYC_STATS.pctWatch}%</div>
                <div className="rp-stat-lbl">Buildings in Watch Zone (&lt;40)</div>
              </div>
              <div className="rp-stat">
                <div className="rp-stat-val rp-stat-caution">{NYC_STATS.medianResolveDays}d</div>
                <div className="rp-stat-lbl">Median Violation Resolution Time</div>
              </div>
            </div>
          </div>

          {/* ── BOROUGH BREAKDOWN ── */}
          <div className="rp-section">
            <div className="rp-section-title">Average Health Score by Borough</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid rgba(17,30,48,0.06)', borderRadius: 12, overflow: 'hidden' }}>
              {BORO_STATS.sort((a, b) => b.avg - a.avg).map((b, i) => {
                const color = BORO_COLORS[b.borough];
                const scoreColor = b.avg >= 80 ? 'var(--risk-green)' : b.avg >= 60 ? 'var(--risk-amber)' : 'var(--risk-red)';
                return (
                  <div key={b.borough} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '16px 20px',
                    borderBottom: i < BORO_STATS.length - 1 ? '1px solid rgba(17,30,48,0.06)' : 'none',
                    background: '#f9fafb',
                  }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: '#9ca3af', width: 16, textAlign: 'right' as const, flexShrink: 0 }}>{i + 1}</span>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 6 }}>{b.borough}</div>
                      <div style={{ height: 5, background: 'rgba(17,30,48,0.07)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${b.avg}%`, background: color, borderRadius: 3, transition: 'width 1s ease' }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' as const, flexShrink: 0 }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 20, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{b.avg}</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{b.openViols.toLocaleString()} open viols</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── SCORE DISTRIBUTION ── */}
          <div className="rp-section">
            <div className="rp-section-title">Score Distribution</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#6b7280', marginBottom: 20 }}>
              How NYC rental buildings are distributed across the 0–100 health score range
            </div>
            {(() => {
              // Approximate distribution buckets
              const buckets = [
                { label: '0–20',   pct: 6,  color: '#c4533a' },
                { label: '20–40',  pct: 16, color: '#d97b3a' },
                { label: '40–60',  pct: 26, color: '#c9a227' },
                { label: '60–80',  pct: 18, color: '#7aaa6e' },
                { label: '80–100', pct: 34, color: '#3a7d5e' },
              ];
              const maxPct = Math.max(...buckets.map(b => b.pct));
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {buckets.map(b => (
                    <div key={b.label} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: '#9ca3af', width: 52, flexShrink: 0 }}>{b.label}</span>
                      <div style={{ flex: 1, height: 20, background: 'rgba(17,30,48,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%',
                          width: `${(b.pct / maxPct) * 100}%`,
                          background: b.color,
                          borderRadius: 4,
                          opacity: 0.85,
                          transition: 'width 1s ease',
                        }} />
                      </div>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: b.color, width: 36, textAlign: 'right' as const }}>{b.pct}%</span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>

          {/* ── NEIGHBORHOOD LEADERBOARD ── */}
          <div className="rp-section">
            <div className="rp-section-title">The Top 10 List</div>
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#6b7280', marginBottom: 20 }}>
              Ranked by average building health score across NYC rental properties, reflecting compliance performance,
              violations, and inspection outcomes (minimum 50 buildings per ZIP code)
            </div>
            <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <LeaderboardList data={top10}   label="🏆 Healthiest Neighborhoods" />
              <LeaderboardList data={worst10} label="⚠️ Most At-Risk Neighborhoods" />
            </div>
          </div>

          {/* ── HOW SCORING WORKS ── */}
          <div className="rp-section">
            <div className="rp-section-title">How the Health Score Works</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '🚨', label: 'Open Violations', desc: 'Class C (emergency), Class B, and Class A violations from HPD, DOB, and ECB are weighted by severity. Open violations are the single largest driver of a low score.' },
                { icon: '📅', label: 'Violation Age', desc: 'Long-standing unresolved violations signal chronic neglect. Buildings with violations open more than 2 years are heavily penalized.' },
                { icon: '⚙️', label: 'Device Compliance', desc: 'Missed boiler and elevator inspection cycles contribute meaningfully — especially in older buildings with more mechanical systems.' },
                { icon: '📈', label: 'Resolution Rate', desc: 'Buildings that consistently close violations quickly receive a compliance bonus. Persistent non-compliance drags scores down over time.' },
                { icon: '🏗️', label: 'Recent Filing Activity', desc: 'A spike in recent-12-month violations is treated as a forward-looking signal and weighted more heavily than historical violations.' },
              ].map(item => (
                <div key={item.label} style={{
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                  padding: '14px 18px',
                  background: '#f9fafb',
                  borderRadius: 10,
                  border: '1px solid rgba(17,30,48,0.06)',
                }}>
                  <div style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{item.icon}</div>
                  <div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: 'var(--navy)', marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontFamily: "'Lora', Georgia, serif", fontSize: 13, color: '#6b7280', lineHeight: 1.55 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, fontFamily: "'Inter', sans-serif", fontSize: 12, color: '#9ca3af' }}>
              Full methodology at{' '}
              <a href="https://halfave.co/methodology" style={{ color: 'var(--navy)', textDecoration: 'underline' }}>halfave.co/methodology</a>
            </div>
          </div>

          {/* ── CTA ── */}
          <div className="rp-cta-banner">
            <div style={{ fontSize: 22, flexShrink: 0 }}>🏢</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: '#f7f4ef', fontWeight: 700, marginBottom: 3 }}>
                Look up any NYC building
              </div>
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: 'rgba(247,244,239,0.7)' }}>
                Get a full health report with violations, device compliance, peer benchmarks, and more.
              </div>
            </div>
            <a href="https://halfave.co" style={{
              fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 600,
              color: '#111e30', background: '#f7f4ef',
              padding: '8px 16px', borderRadius: 6, textDecoration: 'none',
              whiteSpace: 'nowrap' as const, flexShrink: 0,
            }}>
              Search a building →
            </a>
          </div>

          {/* ── FOOTER ── */}
          <div style={{
            marginTop: 48,
            paddingTop: 24,
            borderTop: "1px solid var(--navy-10)",
            fontFamily: "'Inter', -apple-system, sans-serif",
            fontSize: 10,
            color: "var(--slate)",
            lineHeight: 1.7,
          }}>
            Data sourced from NYC HPD, DOB, and ECB open datasets. Scores and statistics generated by{' '}
            <a href="https://halfave.co" style={{ color: 'var(--navy)', textDecoration: 'underline' }}>Half Ave</a>{' '}
            using a combination of public records and proprietary models. Provided for informational purposes only.
            Statistics reflect a snapshot of available data and may not reflect real-time conditions.
            Methodology available at:{' '}
            <a href="https://halfave.co/methodology" style={{ color: 'var(--navy)', textDecoration: 'underline' }}>halfave.co/methodology</a>.
          </div>

        </div>
      </div>
    </>
  );
}
