import { Package } from 'lucide-react'

import { OperatorCard } from '@/components/layout/operator-card'
import { SidebarCollapseToggle } from '@/components/layout/sidebar-collapse-toggle'
import { SidebarNavItem } from '@/components/layout/sidebar-nav-item'
import { env } from '@/config/env'
import { NAV_GROUPS } from '@/config/navigation'
import { PERMISSIONS } from '@/config/permissions'
import {
  isSandboxUnavailable,
  useSandboxAvailable,
} from '@/features/sandbox'
import { useHasPermission } from '@/hooks/use-has-permission'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/stores/sidebar-store'
import { useSessionStore } from '@/stores/session-store'

export function Sidebar() {
  const isOpen = useSidebarStore((state) => state.isOpen)
  const isCollapsed = useSidebarStore((state) => state.isCollapsed)
  const close = useSidebarStore((state) => state.close)
  const toggleCollapsed = useSidebarStore((state) => state.toggleCollapsed)
  const permissions = useSessionStore((state) => state.user?.permissions ?? [])
  const canReadLogs = useHasPermission(PERMISSIONS.logsRead)
  const canSandbox = useHasPermission(PERMISSIONS.systemControl)
  const sandboxProbe = useSandboxAvailable(canSandbox && !env.useMockApi)
  /**
   * Ẩn khi 404 (không phải sandbox).
   * 503 = runtime chưa sẵn — vẫn hiện nav (đúng contract).
   */
  const sandboxVisible =
    env.useMockApi ||
    sandboxProbe.isSuccess ||
    (sandboxProbe.isError && !isSandboxUnavailable(sandboxProbe.error))

  return (
    <aside
      className={cn(
        'row-start-2 flex-col border-r bg-card md:flex',
        isCollapsed ? 'w-14' : 'w-46',
        isOpen ? 'fixed inset-y-0 left-0 z-40 flex' : 'hidden',
      )}
    >
      <div
        className={cn(
          'flex h-13 items-center gap-2.5 border-b text-xs font-semibold',
          isCollapsed ? 'justify-center' : 'px-4',
        )}
      >
        <span className="grid size-6 shrink-0 place-items-center rounded-md bg-primary/40 text-info">
          <Package className="size-4" />
        </span>
        {!isCollapsed && 'AMR Warehouse'}
      </div>

      {NAV_GROUPS.map((group) => {
        const items = group.items.filter((item) => {
          if (item.permission && !permissions.includes(item.permission)) {
            return false
          }
          if (item.requireSandbox && !sandboxVisible) {
            return false
          }
          return true
        })
        if (items.length === 0) {
          return null
        }

        return (
          <div key={group.label} className="pt-3">
            {!isCollapsed && (
              <p className="px-4 pb-1.5 text-[9px] tracking-wider text-faint">
                {group.label}
              </p>
            )}
            {items.map((item) => (
              <SidebarNavItem
                key={item.label}
                item={item}
                isCollapsed={isCollapsed}
                onNavigate={close}
                unreadEnabled={canReadLogs}
              />
            ))}
          </div>
        )
      })}

      <div className="mt-auto">
        <SidebarCollapseToggle
          isCollapsed={isCollapsed}
          onToggle={toggleCollapsed}
        />
        <OperatorCard isCollapsed={isCollapsed} />
      </div>
    </aside>
  )
}
