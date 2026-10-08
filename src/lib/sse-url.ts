import { env } from '@/config/env'

/**
 * Absolute EventSource URL: `{apiUrl}/{path}?access_token=...`
 * path ví dụ: `dispatch/events`, `runtime/events`.
 */
export function buildSseUrl(path: string, accessToken: string) {
  const base = env.apiUrl.replace(/\/$/, '')
  const normalizedPath = path.replace(/^\//, '')
  const absolute = base.startsWith('http')
    ? `${base}/${normalizedPath}`
    : `${window.location.origin}${base.startsWith('/') ? '' : '/'}${base}/${normalizedPath}`
  return `${absolute}?access_token=${encodeURIComponent(accessToken)}`
}
