export type RiskBucket = 'Critical' | 'High Risk' | 'Elevated' | 'Watch' | 'Healthy'

export interface Building {
  id: string
  address: string
  slug: string
  borough: number
  borough_name: string
  stories: number | null
  story_band: string
  unit_count: number | null
  management_program: string | null
  risk_score: number
  risk_bucket: RiskBucket
  percentile: number
  bin?: number | string | null
  top_drivers: Record<string, unknown> | null
}

export interface PivotRow {
  label: string
  Critical: number
  'High Risk': number
  Elevated: number
  Watch: number
  Healthy: number
  avg_score: number
  total: number
}

export interface RiskSummary {
  total: number
  by_bucket: Record<RiskBucket, number>
  by_borough: PivotRow[]
  by_story_band: PivotRow[]
  by_mgmt: PivotRow[]
  top_buildings: Building[]
}

export const RISK_ORDER: RiskBucket[] = ['Critical', 'High Risk', 'Elevated', 'Watch', 'Healthy']

export const RISK_COLORS: Record<RiskBucket, string> = {
  Critical:   '#c4533a',
  'High Risk':'#d97b3a',
  Elevated:   '#c9a227',
  Watch:      '#7a8fa6',
  Healthy:    '#3a7d5e',
}

export const BOROUGH_NAMES: Record<number, string> = {
  1: 'Manhattan',
  2: 'Bronx',
  3: 'Brooklyn',
  4: 'Queens',
  5: 'Staten Island',
}
