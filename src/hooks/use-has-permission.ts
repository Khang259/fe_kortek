import { useSessionStore } from '@/stores/session-store'

/** true nếu user hiện tại có đủ mọi quyền trong danh sách. */
export function useHasPermission(...required: string[]) {
  const permissions = useSessionStore((state) => state.user?.permissions)

  if (!permissions || required.length === 0) {
    return false
  }

  return required.every((permission) => permissions.includes(permission))
}
