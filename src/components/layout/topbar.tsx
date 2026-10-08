import { Menu } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/features/notifications/components/notification-bell'
import { SystemHealthStatus } from '@/features/system'
import {
  AllZonesPowerButton,
  FleetStatusBadge,
  InferenceControlButtons,
} from '@/features/zones'
import { useSidebarStore } from '@/stores/sidebar-store'

export function Topbar() {
  const toggleSidebar = useSidebarStore((state) => state.toggle)

  return (
    <header className="col-span-full flex items-center gap-2.5 border-b bg-surface-raised px-4 text-xs">
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Open menu"
        className="md:hidden"
        onClick={toggleSidebar}
      >
        <Menu />
      </Button>
      <span className="font-semibold">AMR Warehouse</span>
      <FleetStatusBadge />

      <div className="ml-auto flex flex-wrap items-center justify-end gap-2 sm:gap-4">
        <SystemHealthStatus />
        <NotificationBell />
        <InferenceControlButtons />
        <AllZonesPowerButton />
      </div>
    </header>
  )
}
