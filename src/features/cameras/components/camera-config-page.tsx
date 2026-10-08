import { useState } from 'react'
import { Check, Pencil, Plus, X } from 'lucide-react'

import { SectionHeader } from '@/components/common/section-header'
import { Button } from '@/components/ui/button'
import { PERMISSIONS } from '@/config/permissions'
import { AddCameraDialog } from '@/features/cameras/components/add-camera-dialog'
import { CameraFilters } from '@/features/cameras/components/camera-filters'
import { CameraTable } from '@/features/cameras/components/camera-table'
import { useCameraBulkEdit } from '@/features/cameras/hooks/use-camera-bulk-edit'
import { ConfigWriteGateBanner } from '@/features/system/components/config-write-gate-banner'
import { useHasPermission } from '@/hooks/use-has-permission'

export function CameraConfigPage() {
  const [openAdd, setOpenAdd] = useState(false)
  const canWrite = useHasPermission(PERMISSIONS.cameraWrite)
  const {
    isEditing,
    isSaving,
    canWriteConfig,
    startEdit,
    cancelEdit,
    saveEdit,
  } = useCameraBulkEdit()

  return (
    <>
      <SectionHeader
        title="Camera config"
        description={
          isEditing
            ? 'Edit name / RTSP / zone / observed nodes → PATCH update_camera (removing a node cascades deletes)'
            : 'Manage RTSP, zone, observed nodes — disable/delete camera cascades nodes + pairs'
        }
        action={
          canWrite ? (
            <div className="flex flex-wrap items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    variant="outline"
                    disabled={isSaving}
                    onClick={cancelEdit}
                  >
                    <X />
                    Cancel
                  </Button>
                  <Button
                    disabled={isSaving || !canWriteConfig}
                    onClick={saveEdit}
                  >
                    <Check />
                    {isSaving ? 'Updating…' : 'Update'}
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={startEdit}>
                    <Pencil />
                    Edit
                  </Button>
                  <Button onClick={() => setOpenAdd(true)}>
                    <Plus />
                    Add camera
                  </Button>
                </>
              )}
            </div>
          ) : undefined
        }
      />
      <ConfigWriteGateBanner />
      <CameraFilters />
      <CameraTable />
      <AddCameraDialog open={openAdd} onClose={() => setOpenAdd(false)} />
    </>
  )
}
