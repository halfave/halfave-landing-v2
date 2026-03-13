import { useEffect } from 'react'
import MainSite from './MainSite'
import type { Building } from '../types'

interface Props {
  onGetReport: (building: Building) => void
  onGoRisk?: () => void
}

declare global {
  interface Window {
    __halfaveBldg?: {
      bin: number
      address: string
      bbl: string
      stories: string | number
      units: string | number
      borough: string
      riskScore: number
      percentile: number
      riskBucket: string
    }
  }
}

export default function MainSitePage({ onGetReport, onGoRisk }: Props) {
  useEffect(() => {
    function patchLinks() {
      // Intercept risk.html links
      if (onGoRisk) {
        document.querySelectorAll<HTMLAnchorElement>('a[href*="risk.html"]').forEach(link => {
          if (link.dataset.riskPatched) return
          link.dataset.riskPatched = '1'
          link.addEventListener('click', (e) => {
            e.preventDefault()
            e.stopPropagation()
            onGoRisk()
          })
        })
      }

      // Intercept "Unlock Full Building Report" button
      document.querySelectorAll<HTMLAnchorElement>('a[href="#"]').forEach(btn => {
        if (btn.dataset.patched) return
        const text = btn.textContent?.trim() ?? ''
        if (!text.includes('Unlock') && !text.includes('Get Full Report')) return
        btn.dataset.patched = '1'

        btn.addEventListener('click', (e) => {
          e.preventDefault()
          e.stopPropagation()

          const bldg = window.__halfaveBldg
          if (!bldg) return

          const boroughMap: Record<string, number> = {
            'manhattan': 1, 'bronx': 2, 'brooklyn': 3, 'queens': 4, 'staten island': 5,
          }
          const boroughNum = boroughMap[bldg.borough?.toLowerCase?.()] ?? 0

          const building: Building = {
            id: `bin-${bldg.bin}`,
            address: bldg.address || `BIN ${bldg.bin}`,
            slug: `bin-${bldg.bin}`,
            borough: boroughNum,
            borough_name: bldg.borough || 'NYC',
            stories: typeof bldg.stories === 'number' ? bldg.stories : null,
            story_band: 'Unknown',
            unit_count: typeof bldg.units === 'number' ? bldg.units : null,
            management_program: 'PVT',
            risk_score: bldg.riskScore ?? 50,
            risk_bucket: bldg.riskBucket as Building['risk_bucket'] ?? 'Watch',
            percentile: bldg.percentile ?? 50,
            top_drivers: null,
            bin: bldg.bin ?? null,
          }

          onGetReport(building)
        })
      })
    }

    patchLinks()
    const observer = new MutationObserver(patchLinks)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [onGetReport, onGoRisk])

  return <MainSite />
}
