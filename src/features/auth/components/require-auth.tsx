import { Navigate, Outlet, useLocation } from 'react-router'

import { ROUTES } from '@/config/routes'
import { useAuthMe } from '@/features/auth/api/get-me'
import { useSessionStore } from '@/stores/session-store'

/** Chặn mọi route bên trong nếu chưa có accessToken; F5 thì gọi get_me. */
export function RequireAuth() {
  const accessToken = useSessionStore((state) => state.accessToken)
  const location = useLocation()
  useAuthMe(Boolean(accessToken))

  if (!accessToken) {
    return (
      <Navigate
        to={ROUTES.login}
        state={{ from: location.pathname }}
        replace
      />
    )
  }

  return <Outlet />
}
