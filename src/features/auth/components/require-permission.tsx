import { Navigate, Outlet } from 'react-router'

import { useHasPermission } from '@/hooks/use-has-permission'

interface RequirePermissionProps {
  permission: string
  /** Điểm fallback khi thiếu quyền — mặc định về dashboard. */
  fallbackTo?: string
}

/** Chặn route theo `permissions[]` từ get_me — không hardcode role. */
export function RequirePermission({
  permission,
  fallbackTo = '/',
}: RequirePermissionProps) {
  const allowed = useHasPermission(permission)

  if (!allowed) {
    return <Navigate to={fallbackTo} replace />
  }

  return <Outlet />
}
