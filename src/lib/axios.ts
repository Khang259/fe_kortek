import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'

import { env } from '@/config/env'
import { useSessionStore } from '@/stores/session-store'
import type { ApiError } from '@/types'

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean }

export const apiClient = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

/** Client riêng không gắn interceptor — dùng để refresh, tránh vòng lặp 401. */
const refreshClient = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useSessionStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

let isRefreshing = false
let pendingQueue: Array<{
  resolve: (token: string) => void
  reject: (error: unknown) => void
}> = []

function flushQueue(error: unknown, token: string | null) {
  pendingQueue.forEach((item) => {
    if (error || !token) {
      item.reject(error)
      return
    }
    item.resolve(token)
  })
  pendingQueue = []
}

function normalizeErrorMessage(raw: unknown, fallback: string): string {
  if (typeof raw === 'string' && raw.trim()) {
    return raw
  }
  if (Array.isArray(raw)) {
    const parts = raw
      .map((item) => {
        if (typeof item === 'string') return item
        if (
          item &&
          typeof item === 'object' &&
          'msg' in item &&
          typeof (item as { msg: unknown }).msg === 'string'
        ) {
          return (item as { msg: string }).msg
        }
        return null
      })
      .filter((item): item is string => Boolean(item))
    if (parts.length > 0) {
      return parts.join('; ')
    }
  }
  if (raw && typeof raw === 'object') {
    return 'Invalid data'
  }
  return fallback
}

function toApiError(error: AxiosError<{ message?: unknown }>): ApiError {
  return {
    status: error.response?.status ?? 0,
    message: normalizeErrorMessage(
      error.response?.data?.message,
      error.message || 'Unknown error',
    ),
  }
}

function isAuthPath(url?: string) {
  if (!url) return false
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh_token') ||
    url.includes('/auth/logout')
  )
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: unknown }>) => {
    const original = error.config as RetriableConfig | undefined
    const status = error.response?.status

    if (status !== 401 || !original || original._retry || isAuthPath(original.url)) {
      if (status === 401 && isAuthPath(original?.url) && !original?.url?.includes('/auth/logout')) {
        useSessionStore.getState().clearSession()
      }
      return Promise.reject(toApiError(error))
    }

    const { refreshToken } = useSessionStore.getState()
    if (!refreshToken || env.useMockApi) {
      useSessionStore.getState().clearSession()
      return Promise.reject(toApiError(error))
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`
        return apiClient(original)
      })
    }

    original._retry = true
    isRefreshing = true

    try {
      const { data } = await refreshClient.post<{
        accessToken: string
        refreshToken: string
        expiresIn: number
      }>('/auth/refresh_token', { refreshToken })

      useSessionStore
        .getState()
        .setTokens(data.accessToken, data.refreshToken, data.expiresIn)

      flushQueue(null, data.accessToken)
      original.headers.Authorization = `Bearer ${data.accessToken}`
      return apiClient(original)
    } catch (refreshError) {
      flushQueue(refreshError, null)
      useSessionStore.getState().clearSession()
      return Promise.reject(
        refreshError instanceof Error && 'status' in refreshError
          ? refreshError
          : toApiError(refreshError as AxiosError<{ message?: unknown }>),
      )
    } finally {
      isRefreshing = false
    }
  },
)
