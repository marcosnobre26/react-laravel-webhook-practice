import type { HealthResponse } from '../types/health'

const API_URL = import.meta.env.VITE_API_URL

function isHealthResponse(value: unknown): value is HealthResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const { status, database } = value as Record<string, unknown>

  return (
    (status === 'ok' || status === 'degraded') &&
    (database === 'ok' || database === 'down')
  )
}

export async function fetchHealth(
  signal?: AbortSignal,
): Promise<HealthResponse> {
  if (!API_URL) {
    throw new Error('VITE_API_URL is not defined')
  }

  const response = await fetch(`${API_URL}/api/health`, {
    headers: { Accept: 'application/json' },
    signal,
  })

  // 503 is an expected answer: the API is up but reports a degraded dependency.
  if (!response.ok && response.status !== 503) {
    throw new Error(`Unexpected HTTP status ${response.status}`)
  }

  const body: unknown = await response.json()

  if (!isHealthResponse(body)) {
    throw new Error('Unexpected health response shape')
  }

  return body
}