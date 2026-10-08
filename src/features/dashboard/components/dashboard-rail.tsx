import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { DispatchQueuePanel } from '@/features/dispatch'
import { ZoneControlPanel } from '@/features/zones'

/** Cột phải: Zones + pending batch (get_pending_pairs), kéo thanh chia để đổi chiều cao. */
export function DashboardRail() {
  return (
    <aside className="h-full min-h-0 border-l bg-card">
      <ResizablePanelGroup orientation="vertical" className="h-full">
        <ResizablePanel id="rail-zones" minSize={20} defaultSize={25}>
          <ZoneControlPanel />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel id="rail-dispatch" minSize={25} defaultSize={75}>
          <DispatchQueuePanel />
        </ResizablePanel>
      </ResizablePanelGroup>
    </aside>
  )
}
