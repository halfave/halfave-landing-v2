import { useEffect } from 'react'
import MainSite from './MainSite'
import type { Building } from '../types'
import { BOROUGH_NAMES } from '../types'

interface Props {
  onGetReport: (building: Building) => void
  onGoRisk?: () => void
}

export default function MainSitePage({ onGetReport, onGoRisk }: Props) {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      // Intercept "How does NYC compare?" / risk.html links
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

      // Intercept "Get Full Report" button
      const btn = document.querySelector<HTMLAnchorElement>(
        'a[onclick*="scrollIntoView"], a[href="#"][onclick*="bin-section"]'
      )
      if (!btn) return
      if (btn.dataset.patched) return
      btn.dataset.patched = '1'

      btn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()

        const addressEl = document.querySelector<HTMLElement>('.bin-detail-table thead div')
        const address = addressEl?.textContent?.trim() ?? ''

        const scoreEl = document.querySelector<HTMLElement>('[style*="Building Risk Score"] + div')
        const riskScore = scoreEl ? parseFloat(scoreEl.textContent ?? '0') : 0

        const binInput = document.querySelector<HTMLInputElement>('#bin-input')
        const bin = binInput ? parseInt(binInput.value.trim()) : 0

        const boroughMatch = address.match(/,\s*(Manhattan|Bronx|Brooklyn|Queens|Staten Island)/i)
        const boroughName = boroughMatch?.[1] ?? 'NYC'
        const borough = Object.entries(BOROUGH_NAMES).find(([, v]) => v === boroughName)?.[0]

        const building: Building = {
          id: `bin-${bin}`,
          address: address || `BIN ${bin}`,
          slug: `bin-${bin}`,
          borough: borough ? parseInt(borough) : 0,
          borough_name: boroughName,
          stories: null,
          story_band: 'Unknown',
          unit_count: null,
          management_program: 'PVT',
          risk_score: riskScore || 50,
          risk_bucket: riskScore >= 70 ? 'Critical' : riskScore >= 55 ? 'High Risk' : riskScore >= 35 ? 'Elevated' : riskScore >= 20 ? 'Watch' : 'Healthy',
          percentile: 50,
          top_drivers: null,
        }

        onGetReport(building)
      })
    })

    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [onGetReport, onGoRisk])

  return <MainSite />
}
