import { CameraStatusLegend } from '@/features/cameras'
import { NodeMapPanel } from '@/features/dashboard/components/node-map-panel'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'

/**
 * Main dashboard: legend cố định + Node map chiếm phần còn lại, kéo handle
 * để đổi chiều cao map (resizable dọc).
 */
export function DashboardMain() {
  return (
    <main className="flex h-full min-w-0 flex-col gap-3 overflow-hidden p-3">
      <div className="shrink-0">
        <CameraStatusLegend />
      </div>

      <ResizablePanelGroup orientation="vertical" className="min-h-0 flex-1">
        <ResizablePanel
          id="dashboard-node-map"
          minSize={35}
          defaultSize={100}
          className="min-h-0"
        >
          <div className="flex h-full min-h-0 flex-col">
            <NodeMapPanel />
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        {/*
          Panel đệm kéo được — cho phép thu nhỏ map và để khoảng trống bên dưới.
          minSize nhỏ để map vẫn chiếm gần hết khi mới mở.
        */}
        <ResizablePanel
          id="dashboard-map-spacer"
          minSize={0}
          defaultSize={0}
          collapsible
          collapsedSize={0}
          className="min-h-0"
        >
          <div className="size-full rounded-md border border-dashed border-border/60 bg-transparent" />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  )
}
