import { NavLink } from 'react-router'

import type { NavItem } from '@/config/navigation'
import { useUnreadNotificationCount } from '@/features/notifications'
import { cn } from '@/lib/utils'

interface SidebarNavItemProps {
  item: NavItem
  isCollapsed: boolean
  onNavigate: () => void
  /** Tránh gọi unread API khi thiếu logs.read. */
  unreadEnabled?: boolean
}

export function SidebarNavItem({
  item,
  isCollapsed,
  onNavigate,
  unreadEnabled = true,
}: SidebarNavItemProps) {
  const { data: unreadCount = 0 } = useUnreadNotificationCount(
    unreadEnabled && Boolean(item.showUnreadCount),
  )
  const showBadge = unreadEnabled && Boolean(item.showUnreadCount) && unreadCount > 0
  const Icon = item.icon

  const baseClasses = cn(
    'flex w-full items-center gap-2.5 py-2 text-left text-xs text-muted-foreground',
    isCollapsed ? 'justify-center px-0' : 'px-4',
  )

  const badge = showBadge ? (
    <span
      className={cn(
        'grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 text-[10px] font-bold text-white',
        isCollapsed ? 'absolute top-1 right-2' : 'ml-auto',
      )}
    >
      {unreadCount}
    </span>
  ) : null

  if (!item.to) {
    return (
      <span
        title={item.label}
        className={cn(baseClasses, 'cursor-not-allowed opacity-50')}
      >
        <Icon className="size-4 shrink-0" />
        {!isCollapsed && item.label}
      </span>
    )
  }

  return (
    <NavLink
      to={item.to}
      end={item.to === '/'}
      onClick={onNavigate}
      title={item.label}
      className={({ isActive }) =>
        cn(
          baseClasses,
          'relative hover:bg-surface-overlay hover:text-foreground',
          isActive &&
            'bg-surface-overlay text-foreground shadow-[inset_-2px_0_var(--info)]',
        )
      }
    >
      <Icon className="size-4 shrink-0" />
      {!isCollapsed && item.label}
      {badge}
    </NavLink>
  )
}
