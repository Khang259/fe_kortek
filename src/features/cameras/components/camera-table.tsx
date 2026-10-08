import { PaginationBar } from '@/components/common/pagination-bar'
import { TableShell } from '@/components/common/table-shell'
import { CameraTableRow } from '@/features/cameras/components/camera-table-row'
import { useFilteredCameras } from '@/features/cameras/hooks/use-filtered-cameras'
import { useCameraBulkEditStore } from '@/features/cameras/stores/camera-bulk-edit-store'

const columns = ['Camera', 'RTSP URL', 'Zone', 'Observed nodes', 'Status', '']

export function CameraTable() {
  const { cameras, pagination, isPending, isError } = useFilteredCameras()
  const isEditing = useCameraBulkEditStore((state) => state.isEditing)

  return (
    <TableShell
      columns={columns}
      isPending={isPending}
      isError={isError}
      isEmpty={cameras.length === 0}
      emptyMessage="No cameras match the filters"
      footer={<PaginationBar {...pagination} />}
    >
      {cameras.map((camera) => (
        <CameraTableRow
          key={camera.id}
          camera={camera}
          isEditing={isEditing}
        />
      ))}
    </TableShell>
  )
}
