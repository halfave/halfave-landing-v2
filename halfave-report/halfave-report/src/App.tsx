import { useState } from 'react'
import type { Building } from './types'
import LandingPage from './pages/LandingPage'
import BinLookupPage from './pages/BinLookupPage'
import EmailGatePage from './pages/EmailGatePage'
import ReportPage from './pages/ReportPage'

type Step = 'landing' | 'bin' | 'email' | 'report'

export default function App() {
  const [step, setStep] = useState<Step>('landing')
  const [building, setBuilding] = useState<Building | null>(null)
  const [email, setEmail] = useState('')

  function handleBuildingFound(b: Building) {
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
    setStep('landing')
  }

  switch (step) {
    case 'landing':
      return <LandingPage onStart={() => setStep('bin')} />

    case 'bin':
      return <BinLookupPage onFound={handleBuildingFound} onBack={() => setStep('landing')} />

    case 'email':
      return building
        ? <EmailGatePage building={building} onUnlock={handleEmailSubmit} onBack={() => setStep('bin')} />
        : <LandingPage onStart={() => setStep('bin')} />

    case 'report':
      return building && email
        ? <ReportPage building={building} email={email} onReset={handleReset} />
        : <LandingPage onStart={() => setStep('bin')} />
  }
}
