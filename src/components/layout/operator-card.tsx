import { LogOut } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useLogout } from '@/features/auth'
import { cn } from '@/lib/utils'
import { useSessionStore } from '@/stores/session-store'
import { getInitials } from '@/utils'

interface OperatorCardProps {
  isCollapsed: boolean
}

export function OperatorCard({ isCollapsed }: OperatorCardProps) {
  const user = useSessionStore((state) => state.user)
  const logout = useLogout()

  if (!user) {
    return null
  }

  return (
    <div className={cn('border-t p-3', isCollapsed && 'px-2')}>
      <div
        className={cn(
          'flex items-center gap-2 text-muted-foreground',
          isCollapsed && 'flex-col gap-1.5',
        )}
        title={`${user.name} · ${user.role}`}
      >
        <Avatar size="sm">
          <AvatarFallback className="bg-primary/40 text-[9px] font-semibold text-info">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>

        {!isCollapsed && (
          <div className="min-w-0">
            <strong className="block truncate text-[11px] font-medium text-foreground">
              {user.name}
            </strong>
            <small className="block text-[10px]">{user.role}</small>
          </div>
        )}

        <Button
          variant="ghost"
          size="icon-xs"
          aria-label="Log out"
          className={cn(!isCollapsed && 'ml-auto')}
          disabled={logout.isPending}
          onClick={() => logout.mutate()}
        >
          <LogOut />
        </Button>
      </div>
    </div>
  )
}
