export type HealthStatus = 'ok' | 'degraded'
export type DatabaseStatus = 'ok' | 'down'

export interface HealthResponse {
  status: HealthStatus
  database: DatabaseStatus
}