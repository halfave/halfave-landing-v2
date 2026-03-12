import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Building, RiskSummary, PivotRow, RiskBucket } from '../types'
import { BOROUGH_NAMES, RISK_ORDER } from '../types'

function storyBand(stories: number | null): string {
  if (!stories) return 'Unknown'
  if (stories <= 3) return '1–3'
  if (stories <= 6) return '4–6'
  if (stories <= 12) return '7–12'
  return '13+'
}

function buildPivot(rows: Building[], keyFn: (b: Building) => string): PivotRow[] {
  const map: Record<string, PivotRow> = {}
  for (const b of rows) {
    const key = keyFn(b)
    if (!map[key]) {
      map[key] = { label: key, Critical: 0, 'High Risk': 0, Elevated: 0, Watch: 0, Healthy: 0, avg_score: 0, total: 0 }
    }
    map[key][b.risk_bucket as RiskBucket]++
    map[key].total++
    map[key].avg_score += b.risk_score
  }
  return Object.values(map).map(r => ({ ...r, avg_score: Math.round((r.avg_score / r.total) * 10) / 10 }))
}

export function useRiskData() {
  const [data, setData] = useState<RiskSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const { data: rows, error: err } = await supabase
          .schema('analytics')
          .from('buildings')
          .select(`
            id, address, slug, borough, stories, unit_count, management_program,
            building_risk_scores (
              risk_score, risk_bucket, percentile, top_drivers
            )
          `)
          .not('building_risk_scores', 'is', null)

        if (err) throw err

        const buildings: Building[] = (rows ?? []).map((r: any) => {
          const score = r.building_risk_scores?.[0] ?? r.building_risk_scores ?? {}
          return {
            id: r.id,
            address: r.address,
            slug: r.slug,
            borough: r.borough,
            borough_name: BOROUGH_NAMES[r.borough] ?? 'Unknown',
            stories: r.stories,
            story_band: storyBand(r.stories),
            unit_count: r.unit_count,
            management_program: r.management_program ?? 'PVT',
            risk_score: Number(score.risk_score ?? 0),
            risk_bucket: score.risk_bucket as RiskBucket,
            percentile: Number(score.percentile ?? 0),
            top_drivers: score.top_drivers ?? null,
          }
        })

        const by_bucket = RISK_ORDER.reduce((acc, b) => {
          acc[b] = buildings.filter(x => x.risk_bucket === b).length
          return acc
        }, {} as Record<RiskBucket, number>)

        const BOROUGH_ORDER = ['Manhattan', 'Bronx', 'Brooklyn', 'Queens', 'Staten Island']
        const STORY_ORDER = ['1–3', '4–6', '7–12', '13+', 'Unknown']

        const by_borough = buildPivot(buildings, b => b.borough_name)
          .sort((a, b) => BOROUGH_ORDER.indexOf(a.label) - BOROUGH_ORDER.indexOf(b.label))

        const by_story_band = buildPivot(buildings, b => b.story_band)
          .sort((a, b) => STORY_ORDER.indexOf(a.label) - STORY_ORDER.indexOf(b.label))

        const by_mgmt = buildPivot(buildings, b => b.management_program ?? 'Unknown')
          .sort((a, b) => b.total - a.total)

        const top_buildings = [...buildings]
          .sort((a, b) => b.risk_score - a.risk_score)
          .slice(0, 20)

        setData({ total: buildings.length, by_bucket, by_borough, by_story_band, by_mgmt, top_buildings })
      } catch (e: any) {
        setError(e.message ?? 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { data, loading, error }
}
