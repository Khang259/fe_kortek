import { Power, Trash2 } from 'lucide-react'

import { StatusBadge } from '@/components/common/status-badge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { TableCell, TableRow } from '@/components/ui/table'
import { PERMISSIONS } from '@/config/permissions'
import { useDeleteCamera } from '@/features/cameras/api/delete-camera'
import { useSetCameraStatus } from '@/features/cameras/api/set-camera-status'
import {
  useCameraBulkEditStore,
  type CameraEditDraft,
} from '@/features/cameras/stores/camera-bulk-edit-store'
import type { Camera } from '@/features/cameras/types'
import {
  cameraStatusLabels,
  cameraStatusTones,
} from '@/features/cameras/utils/camera-status'
import { useConfigWriteGate } from '@/features/system/hooks/use-config-write-gate'
import { useNodes } from '@/features/nodes'
import { getNodeDisplayName } from '@/features/nodes/utils/node-display-name'
import { useHasPermission } from '@/hooks/use-has-permission'

interface CameraTableRowProps {
  camera: Camera
  isEditing: boolean
}

export function CameraTableRow({ camera, isEditing }: CameraTableRowProps) {
  const setStatus = useSetCameraStatus()
  const deleteCamera = useDeleteCamera()
  const canWrite = useHasPermission(PERMISSIONS.cameraWrite)
  const { canWriteConfig } = useConfigWriteGate()
  const { data: nodes = [] } = useNodes()
  const draft = useCameraBulkEditStore(
    (state) => state.drafts[camera.cameraId],
  )
  const patchDraft = useCameraBulkEditStore((state) => state.patchDraft)

  const labelById = Object.fromEntries(
    nodes.map((node) => [node.id, getNodeDisplayName(node)]),
  )

  const patch = (fields: Partial<Omit<CameraEditDraft, 'cameraId'>>) => {
    patchDraft(camera.cameraId, fields)
  }

  const handleToggleEnabled = () => {
    if (camera.enabled) {
      const ok = window.confirm(
        `Disable camera #${camera.cameraId}?\nThis will cascade-disable all related nodes and pairs.`,
      )
      if (!ok) {
        return
      }
    }
    setStatus.mutate({
      cameraId: camera.cameraId,
      enabled: !camera.enabled,
    })
  }

  const handleDelete = () => {
    const ok = window.confirm(
      `Delete camera #${camera.cameraId} (${camera.name})?\nThis cascades deletion of all nodes, ROI, and pairs for this camera.`,
    )
    if (!ok) {
      return
    }
    deleteCamera.mutate(camera.cameraId)
  }

  const busy = setStatus.isPending || deleteCamera.isPending
  const actionsDisabled = busy || !canWriteConfig

  return (
    <TableRow className="text-[11px]">
      <TableCell className="font-semibold">
        {isEditing && draft ? (
          <Input
            value={draft.name}
            onChange={(event) => patch({ name: event.target.value })}
            aria-label={`Camera name ${camera.cameraId}`}
            className="h-7 font-semibold text-[11px]"
          />
        ) : (
          <span className="block">{camera.name}</span>
        )}
      </TableCell>

      <TableCell>
        {isEditing && draft ? (
          <Input
            value={draft.rtspUrl}
            onChange={(event) => patch({ rtspUrl: event.target.value })}
            aria-label={`RTSP camera ${camera.cameraId}`}
            className="h-7 min-w-40 font-mono text-[10px]"
          />
        ) : (
          <span className="font-mono text-[10px] text-muted-foreground">
            {camera.rtspUrl}
          </span>
        )}
      </TableCell>

      <TableCell>
        {isEditing && draft ? (
          <Input
            value={draft.zone}
            onChange={(event) => patch({ zone: event.target.value })}
            aria-label={`Zone camera ${camera.cameraId}`}
            className="h-7 w-20 text-[10px]"
          />
        ) : (
          camera.zone
        )}
      </TableCell>

      <TableCell>
        {isEditing && draft ? (
          <div className="grid min-w-44 gap-1">
            <Input
              value={draft.observedNodeIdsText}
              onChange={(event) =>
                patch({ observedNodeIdsText: event.target.value })
              }
              aria-label={`Observed nodes camera ${camera.cameraId}`}
              placeholder="nodeId, nodeId…"
              className="h-7 font-mono text-[10px]"
            />
          </div>
        ) : (
          <div className="flex flex-wrap gap-1">
            {camera.observedNodeIds.map((nodeId) => (
              <Badge
                key={nodeId}
                variant="outline"
                className="border-info/40 bg-info-muted text-[9px] text-info"
                title={nodeId}
              >
                {labelById[nodeId] ?? nodeId}
              </Badge>
            ))}
          </div>
        )}
      </TableCell>

      <TableCell>
        <StatusBadge tone={cameraStatusTones[camera.status]}>
          {cameraStatusLabels[camera.status]}
        </StatusBadge>
      </TableCell>

      <TableCell>
        <div className="flex justify-end gap-1">
          {canWrite && !isEditing ? (
            <>
              <Button
                variant={camera.enabled ? 'destructive' : 'outline'}
                size="icon-xs"
                aria-label={
                  camera.enabled ? 'Disable camera' : 'Enable camera'
                }
                disabled={actionsDisabled}
                title={
                  camera.enabled
                    ? 'Disable → cascade nodes + pairs'
                    : 'Enable camera'
                }
                onClick={handleToggleEnabled}
              >
                <Power />
              </Button>
              <Button
                variant="destructive"
                size="icon-xs"
                aria-label="Delete camera"
                disabled={actionsDisabled}
                title="delete_camera — cascade nodes/ROI/pairs"
                onClick={handleDelete}
              >
                <Trash2 />
              </Button>
            </>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  )
}
