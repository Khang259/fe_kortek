import { Check } from 'lucide-react'

import { QueryState } from '@/components/common/query-state'
import { SectionHeader } from '@/components/common/section-header'
import { Button } from '@/components/ui/button'
import { PERMISSIONS } from '@/config/permissions'
import { useNotifications } from '@/features/notifications/api/get-notifications'
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from '@/features/notifications/api/mark-notifications-read'
import { NotificationItem } from '@/features/notifications/components/notification-item'
import { isNotificationUnread } from '@/features/notifications/types'
import { useHasPermission } from '@/hooks/use-has-permission'

export function NotificationsPage() {
  const canRead = useHasPermission(PERMISSIONS.logsRead)
  const { data, isPending, isError } = useNotifications()
  const notifications = data?.items ?? []
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  if (!canRead) {
    return (
      <main className="min-w-0 overflow-auto px-6 py-6">
        <p className="text-sm text-muted-foreground">
          Missing <code>logs.read</code> permission to view notifications.
        </p>
      </main>
    )
  }

  return (
    <main className="min-w-0 overflow-auto px-6 py-6">
      <SectionHeader
        title="Notifications"
        description="Your notifications and system broadcasts"
        action={
          <Button
            onClick={() => markAll.mutate()}
            disabled={
              markAll.isPending ||
              notifications.every((n) => !isNotificationUnread(n))
            }
          >
            <Check />
            Mark all as read
          </Button>
        }
      />
      <QueryState
        isPending={isPending}
        isError={isError}
        isEmpty={notifications.length === 0}
        emptyMessage="No notifications"
      >
        <div className="max-w-4xl overflow-hidden rounded-lg border bg-card">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRead={(id) => markRead.mutate(id)}
            />
          ))}
        </div>
      </QueryState>
    </main>
  )
}
