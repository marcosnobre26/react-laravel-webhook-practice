import { useEffect, useState } from 'react'
import { fetchHealth } from './api/health'
import type { HealthResponse } from './types/health'
import './App.css'

type HealthState =
  | { kind: 'loading' }
  | { kind: 'success'; data: HealthResponse }
  | { kind: 'error' }

type StatusVariant = 'pending' | 'ok' | 'warning' | 'error'

function describe(state: HealthState): { variant: StatusVariant; text: string } {
  switch (state.kind) {
    case 'loading':
      return { variant: 'pending', text: 'Checking API status…' }
    case 'error':
      return {
        variant: 'error',
        text: 'Could not reach the API. Please try again.',
      }
    case 'success':
      return state.data.database === 'ok'
        ? { variant: 'ok', text: 'API is up and the database is reachable.' }
        : {
            variant: 'warning',
            text: 'API is up, but the database is unavailable.',
          }
  }
}

function App() {
  const [state, setState] = useState<HealthState>({ kind: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    fetchHealth(controller.signal)
      .then((data) => setState({ kind: 'success', data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return
        }

        console.error('Health check request failed', error)
        setState({ kind: 'error' })
      })

    return () => controller.abort()
  }, [attempt])

  function handleRetry() {
    setState({ kind: 'loading' })
    setAttempt((current) => current + 1)
  }

  const { variant, text } = describe(state)

  return (
    <main className="health">
      <h1>ShopLite</h1>
      <h2>API status</h2>

      <p role="status" className={`health__status health__status--${variant}`}>
        {text}
      </p>

      <button
        type="button"
        onClick={handleRetry}
        disabled={state.kind === 'loading'}
      >
        Check again
      </button>
    </main>
  )
}

export default App