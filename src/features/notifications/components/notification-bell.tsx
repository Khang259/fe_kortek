import { Bell } from 'lucide-react'
import { Link } from 'react-router'

import { Button } from '@/components/ui/button'
import { PERMISSIONS } from '@/config/permissions'
import { ROUTES } from '@/config/routes'
import { useUnreadNotificationCount } from '@/features/notifications/api/get-notifications'
import { useHasPermission } from '@/hooks/use-has-permission'

export function NotificationBell() {
  const canRead = useHasPermission(PERMISSIONS.logsRead)
  const { data: unreadCount = 0 } = useUnreadNotificationCount(canRead)

  if (!canRead) {
    return null
  }

  return (
    <Button
      variant="outline"
      size="icon-sm"
      aria-label={`${unreadCount} unread notifications`}
      className="relative"
      render={<Link to={ROUTES.notifications} />}
    >
      <Bell />
      {unreadCount > 0 ? (
        <span className="absolute -top-1.5 -right-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
          {unreadCount}
        </span>
      ) : null}
    </Button>
  )
}
