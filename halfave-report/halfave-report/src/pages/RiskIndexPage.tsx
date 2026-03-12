import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const BOROUGH_NAMES: Record<number, string> = {
  1: 'Manhattan', 2: 'Bronx', 3: 'Brooklyn', 4: 'Queens', 5: 'Staten Island',
};
const BUCKET_COLORS: Record<string, string> = {
  Critical: '#c4533a', 'High Risk': '#d97b3a', Elevated: '#c9a227', Watch: '#7a8fa6', Healthy: '#3a7d5e',
};
const BUCKET_BG: Record<string, string> = {
  Critical: '#fef2f2', 'High Risk': '#fff7ed', Elevated: '#fefce8', Watch: '#f1f5f9', Healthy: '#f0fdf4',
};

interface BucketStat { risk_bucket: string; count: number; avg_score: number; min_score: number; max_score: number; }
interface BoroughStat { borough: number; count: number; avg_score: number; high_risk_count: number; }
interface TopBuilding { address: string; borough: number; risk_score: number; risk_bucket: string; open_violations: number; }

const BUCKET_ORDER = ['Critical', 'High Risk', 'Elevated', 'Watch', 'Healthy'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = (supabase as any).schema('analytics');

interface Props { onBack?: () => void }

export default function RiskIndexPage({ onBack }: Props) {
  const [buckets, setBuckets] = useState<BucketStat[]>([]);
  const [boroughs, setBoroughs] = useState<BoroughStat[]>([]);
  const [topBuildings, setTopBuildings] = useState<TopBuilding[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [scoresRes, buildingsRes, topRes] = await Promise.all([
          db.from('building_risk_scores').select('risk_bucket, risk_score'),
          db.from('buildings').select('borough, building_risk_scores!inner(risk_score, risk_bucket)'),
          db.from('building_risk_scores')
            .select('risk_score, risk_bucket, buildings!inner(address, borough), building_features!inner(open_violations)')
            .order('risk_score', { ascending: false })
            .limit(20),
        ]);

        if (scoresRes.data) {
          const rows = scoresRes.data as { risk_bucket: string; risk_score: number }[];
          setTotal(rows.length);
          const map: Record<string, number[]> = {};
          for (const r of rows) {
            if (!map[r.risk_bucket]) map[r.risk_bucket] = [];
            map[r.risk_bucket].push(r.risk_score);
          }
          setBuckets(BUCKET_ORDER.map(b => {
            const scores = map[b] ?? [];
            return {
              risk_bucket: b,
              count: scores.length,
              avg_score: scores.length ? Math.round(scores.reduce((a, x) => a + x, 0) / scores.length * 10) / 10 : 0,
              min_score: scores.length ? Math.min(...scores) : 0,
              max_score: scores.length ? Math.max(...scores) : 0,
            };
          }));
        }

        if (buildingsRes.data) {
          const map: Record<number, { scores: number[]; high: number }> = {};
          for (const b of buildingsRes.data as { borough: number; building_risk_scores: { risk_score: number; risk_bucket: string } }[]) {
            const boro = b.borough;
            const r = b.building_risk_scores;
            if (!map[boro]) map[boro] = { scores: [], high: 0 };
            map[boro].scores.push(r.risk_score);
            if (r.risk_bucket === 'Critical' || r.risk_bucket === 'High Risk') map[boro].high++;
          }
          setBoroughs(Object.entries(map).map(([boro, v]) => ({
            borough: Number(boro),
            count: v.scores.length,
            avg_score: Math.round(v.scores.reduce((a, x) => a + x, 0) / v.scores.length * 10) / 10,
            high_risk_count: v.high,
          })).sort((a, b) => b.avg_score - a.avg_score));
        }

        if (topRes.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setTopBuildings((topRes.data as any[]).map((r: any) => ({
            address: r.buildings?.address || '—',
            borough: r.buildings?.borough,
            risk_score: r.risk_score,
            risk_bucket: r.risk_bucket,
            open_violations: r.building_features?.open_violations || 0,
          })));
        }
      } catch (err) {
        console.error('RiskIndexPage load error:', err);
      }
      setLoading(false);
    }
    load();
  }, []);

  const maxBoroughScore = Math.max(...boroughs.map(b => b.avg_score), 1);

  return (
    <div style={{ fontFamily: 'var(--sans, system-ui, sans-serif)', background: '#f7f4ef', minHeight: '100vh' }}>
      <nav style={{ background: '#111e30', padding: '0 2rem', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 }}>
        <span style={{ fontFamily: 'Georgia, serif', color: '#f7f4ef', fontSize: '1.1rem', fontWeight: 600, letterSpacing: '-0.02em' }}>half/ave</span>
        {onBack && (
          <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', padding: '0.4rem 1rem', borderRadius: '50px', fontSize: '0.8rem', cursor: 'pointer' }}>
            ← Back
          </button>
        )}
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7a8fa6', marginBottom: '0.5rem' }}>NYC Building Risk Index</div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(1.8rem, 5vw, 2.8rem)', fontWeight: 500, color: '#111e30', lineHeight: 1.15, margin: '0 0 0.75rem', letterSpacing: '-0.02em' }}>
            How does your building<br />compare to NYC?
          </h1>
          <p style={{ fontSize: '1rem', color: '#6b7280', maxWidth: 520, margin: 0, lineHeight: 1.6 }}>
            Risk scores across <strong style={{ color: '#111e30' }}>{total.toLocaleString()} NYC buildings</strong> based on open violations, recent activity, and severity-weighted compliance exposure.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3].map(i => <div key={i} style={{ background: '#fff', borderRadius: 16, height: 120, opacity: 0.5 }} />)}
          </div>
        ) : (
          <>
            <section style={{ background: '#fff', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '1.25rem' }}>Score Distribution</div>
              <div style={{ display: 'flex', height: 28, borderRadius: 8, overflow: 'hidden', marginBottom: '1rem', gap: 2 }}>
                {BUCKET_ORDER.map(b => {
                  const stat = buckets.find(s => s.risk_bucket === b);
                  const pct = stat ? (stat.count / total) * 100 : 0;
                  return <div key={b} title={`${b}: ${stat?.count} buildings`} style={{ flex: `0 0 ${pct}%`, background: BUCKET_COLORS[b] }} />;
                })}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {BUCKET_ORDER.map(b => {
                  const stat = buckets.find(s => s.risk_bucket === b);
                  return (
                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
                      <span style={{ width: 10, height: 10, borderRadius: 3, background: BUCKET_COLORS[b], flexShrink: 0 }} />
                      <span style={{ color: '#374151', fontWeight: 600 }}>{b}</span>
                      <span style={{ color: '#9ca3af' }}>({stat?.count ?? 0})</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {BUCKET_ORDER.map(b => {
                  const stat = buckets.find(s => s.risk_bucket === b);
                  if (!stat) return null;
                  const pct = Math.round((stat.count / total) * 100);
                  return (
                    <div key={b} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', borderRadius: 10, background: BUCKET_BG[b] }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: BUCKET_COLORS[b], flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.875rem', color: BUCKET_COLORS[b] }}>{b}</div>
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>Score {stat.min_score}–{stat.max_score}</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111e30' }}>{stat.count.toLocaleString()}</div>
                        <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{pct}% of index</div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 60 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#374151' }}>avg {stat.avg_score}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section style={{ background: '#fff', borderRadius: 20, padding: '2rem', marginBottom: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '1.25rem' }}>By Borough — Average Risk Score</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {boroughs.map(b => {
                  const barPct = (b.avg_score / maxBoroughScore) * 100;
                  return (
                    <div key={b.borough} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 100, fontSize: '0.85rem', fontWeight: 600, color: '#374151', flexShrink: 0 }}>{BOROUGH_NAMES[b.borough]}</div>
                      <div style={{ flex: 1, background: '#f3f4f6', borderRadius: 6, height: 24, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${barPct}%`, background: '#111e30', borderRadius: 6 }} />
                        <div style={{ position: 'absolute', left: 10, top: 0, bottom: 0, display: 'flex', alignItems: 'center', fontSize: '0.75rem', fontWeight: 600, color: barPct > 25 ? '#fff' : '#374151' }}>
                          {b.avg_score}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 80 }}>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{b.count} bldgs</div>
                        {b.high_risk_count > 0 && <div style={{ fontSize: '0.7rem', color: '#c4533a', fontWeight: 600 }}>{b.high_risk_count} high risk</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section style={{ background: '#fff', borderRadius: 20, padding: '2rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '1.25rem' }}>Highest Risk Buildings</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {topBuildings.map((bldg, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.9rem 0', borderBottom: i < topBuildings.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: BUCKET_BG[bldg.risk_bucket] ?? '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia, serif', fontWeight: 700, fontSize: '0.85rem', color: BUCKET_COLORS[bldg.risk_bucket] ?? '#374151', flexShrink: 0 }}>
                      {bldg.risk_score}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#111e30', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{bldg.address}</div>
                      <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{BOROUGH_NAMES[bldg.borough]} · {bldg.open_violations} open violations</div>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: 50, fontSize: '0.68rem', fontWeight: 700, background: BUCKET_BG[bldg.risk_bucket] ?? '#f3f4f6', color: BUCKET_COLORS[bldg.risk_bucket] ?? '#374151', flexShrink: 0 }}>
                      {bldg.risk_bucket}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <p style={{ textAlign: 'center', fontSize: '0.75rem', color: '#9ca3af', marginTop: '2rem' }}>
              Risk scores calculated from open HPD violations, DOB/ECB penalties, severity weighting, and recency signals. Index covers {total} NYC multifamily buildings.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
