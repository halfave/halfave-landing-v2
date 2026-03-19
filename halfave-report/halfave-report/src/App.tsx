import { useState, useEffect } from 'react'
import type { Building } from './types'
import MainSitePage from './pages/MainSitePage'
import EmailGatePage from './pages/EmailGatePage'
import ReportPage from './pages/ReportPage'
import RiskIndexPage from './pages/RiskIndexPage'
import HealthPage from './pages/HealthPage'

type Step = 'main' | 'email' | 'report' | 'risk' | 'health'

export default function App() {
  const [step, setStep] = useState<Step>(() => {
    if (window.location.pathname === '/risk' || window.location.hash === '#risk') return 'risk'
    if (window.location.pathname === '/health') return 'health'
    // Deep-link from email: /report?bin=XXXXXXX skips the gate
    const params = new URLSearchParams(window.location.search)
    if ((window.location.pathname === '/report' || params.has('bin')) && params.get('bin')) return 'report'
    return 'main'
  })
  const [building, setBuilding] = useState<Building | null>(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (step === 'risk')   window.history.pushState({}, '', '/risk')
    else if (step === 'health') window.history.pushState({}, '', '/health')
    else if (step === 'main')  window.history.pushState({}, '', '/')
  }, [step])

  useEffect(() => {
    const onPop = () => {
      if (window.location.pathname === '/risk')   setStep('risk')
      else if (window.location.pathname === '/health') setStep('health')
      else setStep('main')
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  function handleGetReport(b: Building) { setBuilding(b); setStep('email') }
  function handleEmailSubmit(e: string) { setEmail(e); setStep('report') }
  function handleReset() { setBuilding(null); setEmail(''); setStep('main') }
  function handleGoRisk() { setStep('risk') }

  switch (step) {
    case 'risk':
      return <RiskIndexPage onBack={handleReset} />
    case 'health':
      return <HealthPage />
    case 'main':
      return <MainSitePage onGetReport={handleGetReport} onGoRisk={handleGoRisk} />
    case 'email':
      return building
        ? <EmailGatePage building={building} onUnlock={handleEmailSubmit} onBack={handleReset} />
        : <MainSitePage onGetReport={handleGetReport} onGoRisk={handleGoRisk} />
    case 'report':
      return building && email
        ? <ReportPage building={building} email={email} onReset={handleReset} onGoRisk={handleGoRisk} />
        : <MainSitePage onGetReport={handleGetReport} onGoRisk={handleGoRisk} />
  }
}
