import { useEffect } from 'react'
import MainSite from './MainSite'
import type { Building } from '../types'
import { BOROUGH_NAMES } from '../types'

interface Props {
  onGetReport: (building: Building) => void
}

/**
 * Wraps the real MainSite component.
 * After the BIN lookup renders a result, it intercepts the "Get Full Report"
 * button click and extracts the resolved building data into our app's flow.
 */
export default function MainSitePage({ onGetReport }: Props) {
  useEffect(() => {
    // Poll for the "Get Full Report" button appearing in the DOM.
    // The inline script in MainSite renders it dynamically after a BIN lookup,
    // so we need a MutationObserver to detect it.
    const observer = new MutationObserver(() => {
      const btn = document.querySelector<HTMLAnchorElement>(
        'a[onclick*="scrollIntoView"], a[href="#"][onclick*="bin-section"]'
      )
      if (!btn) return

      // Already patched
      if (btn.dataset.patched) return
      btn.dataset.patched = '1'

      btn.addEventListener('click', (e) => {
        e.preventDefault()
        e.stopPropagation()

        // Extract address from the rendered detail table
        const addressEl = document.querySelector<HTMLElement>('.bin-detail-table thead div')
        const address = addressEl?.textContent?.trim() ?? ''

        // Extract score and bucket from the rendered risk score block
        const scoreEl = document.querySelector<HTMLElement>('[style*="Building Risk Score"] + div')
        const riskScore = scoreEl ? parseFloat(scoreEl.textContent ?? '0') : 0

        // Extract BIN from the input
        const binInput = document.querySelector<HTMLInputElement>('#bin-input')
        const bin = binInput ? parseInt(binInput.value.trim()) : 0

        // Extract borough from address (last segment before NY)
        const boroughMatch = address.match(/,\s*(Manhattan|Bronx|Brooklyn|Queens|Staten Island)/i)
        const boroughName = boroughMatch?.[1] ?? 'NYC'
        const borough = Object.entries(BOROUGH_NAMES).find(([, v]) => v === boroughName)?.[0]

        // Build a minimal Building object — score and address are what matter for the email gate
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
  }, [onGetReport])

  return <MainSite />
}
