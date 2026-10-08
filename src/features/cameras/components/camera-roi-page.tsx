import { PaginationBar } from '@/components/common/pagination-bar'
import { SectionHeader } from '@/components/common/section-header'
import { TableShell } from '@/components/common/table-shell'
import { useCameras } from '@/features/cameras/api/get-cameras'
import { CameraRoiRow } from '@/features/cameras/components/camera-roi-row'
import { RoiFilters } from '@/features/cameras/components/roi-filters'
import { RoiDrawDialog } from '@/features/cameras/components/roi-draw-dialog'
import { useFilteredRoiCameras } from '@/features/cameras/hooks/use-filtered-roi-cameras'
import { useRoiDrawStore } from '@/features/cameras/stores/roi-draw-store'
import { ConfigWriteGateBanner } from '@/features/system/components/config-write-gate-banner'

const columns = ['Camera', 'Zone', 'Observed nodes', 'Configured ROI', '']

export function CameraRoiPage() {
  const { cameras, rois, pagination, isPending, isError } =
    useFilteredRoiCameras()
  const { data: allCameras = [] } = useCameras()

  const drawingCameraId = useRoiDrawStore((state) => state.cameraId)
  const closeDraw = useRoiDrawStore((state) => state.close)
  const drawingCamera =
    allCameras.find((camera) => camera.cameraId === drawingCameraId) ?? null

  return (
    <>
      <SectionHeader
        title="ROI config"
        description="Draw ROI on WebRTC preview and map to the default 640×480 frame. Deleting ROI cascades pair deletion."
      />
      <ConfigWriteGateBanner />
      <RoiFilters />
      <TableShell
        columns={columns}
        isPending={isPending}
        isError={isError}
        isEmpty={cameras.length === 0}
        emptyMessage="No cameras match the filters"
        footer={<PaginationBar {...pagination} />}
      >
        {cameras.map((camera) => (
          <CameraRoiRow
            key={camera.cameraId}
            camera={camera}
            rois={rois.filter((roi) => roi.cameraId === camera.cameraId)}
          />
        ))}
      </TableShell>

      <RoiDrawDialog camera={drawingCamera} onClose={closeDraw} />
    </>
  )
}
