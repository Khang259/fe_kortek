import { StatusBadge } from '@/components/common/status-badge'
import { AuthSnapshotImage } from '@/features/snapshots/components/auth-snapshot-image'
import type { AppNotification } from '@/features/notifications/types'
import {
  getDispatchFailedMeta,
  isDispatchFailedNotification,
  isNotificationUnread,
} from '@/features/notifications/types'
import { cn } from '@/lib/utils'
import type { StatusTone } from '@/types'
import { formatClock } from '@/utils'

function notificationTone(type: string): StatusTone {
  if (type.includes('fail') || type.includes('error')) {
    return 'danger'
  }
  if (type.includes('warn') || type.includes('offline') || type.includes('stop')) {
    return 'warning'
  }
  return 'info'
}

interface NotificationItemProps {
  notification: AppNotification
  onRead: (id: string) => void
}

export function NotificationItem({
  notification,
  onRead,
}: NotificationItemProps) {
  const unread = isNotificationUnread(notification)
  const tone = notificationTone(notification.type)
  const dispatchMeta = isDispatchFailedNotification(notification)
    ? getDispatchFailedMeta(notification)
    : null

  return (
    <div
      className={cn(
        'grid gap-2 border-b bg-card px-4 py-4 last:border-b-0',
        !unread && 'opacity-60',
      )}
    >
      <button
        type="button"
        onClick={() => {
          if (unread) onRead(notification.id)
        }}
        className="flex w-full items-center gap-3.5 text-left hover:opacity-90"
      >
        <span
          aria-hidden
          className={cn(
            'size-2 shrink-0 rounded-full',
            unread
              ? tone === 'danger'
                ? 'bg-danger'
                : 'bg-warning'
              : 'bg-faint',
          )}
        />
        <span className="grid flex-1 gap-1">
          <span className="flex flex-wrap items-center gap-2">
            <strong className="text-[13px] font-semibold">
              {notification.title}
            </strong>
            <StatusBadge tone={tone}>{notification.type}</StatusBadge>
          </span>
          <small className="text-xs text-muted-foreground">
            {notification.message}
          </small>
          {dispatchMeta ? (
            <small className="text-[11px] text-faint">
              {dispatchMeta.startNodeId} → {dispatchMeta.endNodeId}
              {dispatchMeta.orderId ? ` · order ${dispatchMeta.orderId}` : ''}
            </small>
          ) : null}
        </span>
        <time className="text-[11px] text-muted-foreground">
          {formatClock(notification.createdAt)}
        </time>
      </button>

      {notification.snapshotImageUrl ? (
        <div className="pl-5">
          <AuthSnapshotImage
            snapshotImageUrl={notification.snapshotImageUrl}
            alt={`Snapshot ${notification.title}`}
          />
        </div>
      ) : null}
    </div>
  )
}
