import { useState } from 'react'
import type { Building } from './types'
import MainSitePage from './pages/MainSitePage'
import EmailGatePage from './pages/EmailGatePage'
import ReportPage from './pages/ReportPage'

type Step = 'main' | 'email' | 'report'

export default function App() {
  const [step, setStep] = useState<Step>('main')
  const [building, setBuilding] = useState<Building | null>(null)
  const [email, setEmail] = useState('')

  function handleGetReport(b: Building) {
    setBuilding(b)
    setStep('email')
  }

  function handleEmailSubmit(e: string) {
    setEmail(e)
    setStep('report')
  }

  function handleReset() {
    setBuilding(null)
    setEmail('')
    setStep('main')
  }

  switch (step) {
    case 'main':
      return <MainSitePage onGetReport={handleGetReport} />

    case 'email':
      return building
        ? <EmailGatePage building={building} onUnlock={handleEmailSubmit} onBack={handleReset} />
        : <MainSitePage onGetReport={handleGetReport} />

    case 'report':
      return building && email
        ? <ReportPage building={building} email={email} onReset={handleReset} />
        : <MainSitePage onGetReport={handleGetReport} />
  }
}
