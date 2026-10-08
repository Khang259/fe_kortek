import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { CameraPreviewDialog } from '@/features/cameras'
import { DashboardMain } from '@/features/dashboard/components/dashboard-main'
import { DashboardRail } from '@/features/dashboard/components/dashboard-rail'
import { useMediaQuery } from '@/hooks/use-media-query'

export function DashboardPage() {
  /**
   * Dưới 1280px không đủ chỗ cho hai cột, nên render thẳng phần chính thay vì
   * dựng panel group rồi ẩn bằng CSS — panel bị ẩn vẫn chiếm chỗ trong layout.
   */
  const isWideScreen = useMediaQuery('(min-width: 1280px)')

  return (
    <>
      {isWideScreen ? (
        <ResizablePanelGroup orientation="horizontal" className="h-full">
          <ResizablePanel id="dashboard-main" minSize="55" defaultSize="78">
            <DashboardMain />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel
            id="dashboard-rail"
            minSize="14"
            maxSize="40"
            defaultSize="22"
          >
            <DashboardRail />
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <DashboardMain />
      )}
      <CameraPreviewDialog />
    </>
  )
}
