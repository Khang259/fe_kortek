import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { AuthUser } from '@/types'

interface SessionState {
  accessToken: string | null
  refreshToken: string | null
  /** Thời hạn access token (giây), từ login/refresh. */
  expiresIn: number | null
  user: AuthUser | null
  setSession: (payload: {
    accessToken: string
    refreshToken: string
    expiresIn: number
    user: AuthUser
  }) => void
  setTokens: (accessToken: string, refreshToken: string, expiresIn: number) => void
  setUser: (user: AuthUser) => void
  clearSession: () => void
}

interface LegacySession {
  token?: string | null
  accessToken?: string | null
  refreshToken?: string | null
  expiresIn?: number | null
  user?: AuthUser | null
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      expiresIn: null,
      user: null,

      setSession: ({ accessToken, refreshToken, expiresIn, user }) =>
        set({ accessToken, refreshToken, expiresIn, user }),

      setTokens: (accessToken, refreshToken, expiresIn) =>
        set({ accessToken, refreshToken, expiresIn }),

      setUser: (user) => set({ user }),

      clearSession: () =>
        set({
          accessToken: null,
          refreshToken: null,
          expiresIn: null,
          user: null,
        }),
    }),
    {
      name: 'amr-session',
      version: 2,
      /** Session cũ chỉ có `token` → chuyển sang accessToken, bắt login lại nếu thiếu refresh. */
      migrate: (persisted) => {
        const state = persisted as LegacySession
        if (state?.token && !state.accessToken) {
          return {
            accessToken: state.token,
            refreshToken: null,
            expiresIn: null,
            user: state.user ?? null,
          }
        }
        return {
          accessToken: state?.accessToken ?? null,
          refreshToken: state?.refreshToken ?? null,
          expiresIn: state?.expiresIn ?? null,
          user: state?.user ?? null,
        }
      },
    },
  ),
)
