import { Outlet } from 'react-router'

import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { useActiveTasksSse } from '@/features/dispatch'
import { useNodeRuntimeSse } from '@/features/nodes/hooks/use-node-runtime-sse'
import { usePollSnapshot } from '@/features/poll'
import { cn } from '@/lib/utils'
import { useSidebarStore } from '@/stores/sidebar-store'

export function AppShell() {
  const isCollapsed = useSidebarStore((state) => state.isCollapsed)

  /** Poll snapshot cameras/zones + fallback nodes khi SSE lỗi. */
  usePollSnapshot()
  /** Snapshot get_runtime_state → SSE node.runtime. */
  useNodeRuntimeSse()
  /** SSE dispatch.task trước → GET get_active_tasks hydrate. */
  useActiveTasksSse()

  return (
    <div
      className={cn(
        'grid min-h-screen grid-rows-[48px_1fr] bg-background',
        isCollapsed
          ? 'md:grid-cols-[56px_minmax(0,1fr)]'
          : 'md:grid-cols-[184px_minmax(0,1fr)]',
      )}
    >
      <Topbar />
      <Sidebar />
      <div className="row-start-2 min-w-0 overflow-auto md:col-start-2">
        <Outlet />
      </div>
    </div>
  )
}
