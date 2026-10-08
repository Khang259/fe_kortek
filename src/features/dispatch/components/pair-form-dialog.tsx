import { useEffect, useMemo, useState } from 'react'

import { FilterSelect } from '@/components/common/filter-select'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { useCameraRois } from '@/features/cameras/api/get-camera-rois'
import { useCreatePair } from '@/features/dispatch/api/pair-mutations'
import type { PairType } from '@/features/dispatch/types'
import { useNodes } from '@/features/nodes'
import { getNodeDisplayName } from '@/features/nodes/utils/node-display-name'
import { useConfigWriteGate } from '@/features/system/hooks/use-config-write-gate'

const PAIR_TYPE_OPTIONS = [
  { label: 'Normal', value: 'normal' },
  { label: 'Empty', value: 'empty' },
]

interface PairFormDialogProps {
  open: boolean
  onClose: () => void
}

/** Dialog tạo pair — dropdown chỉ node đã có ROI; không gửi zoneId. */
export function PairFormDialog({ open, onClose }: PairFormDialogProps) {
  const { data: nodes = [] } = useNodes()
  const { data: rois = [] } = useCameraRois()
  const createPair = useCreatePair()
  const { canWriteConfig, gateMessage } = useConfigWriteGate()

  const [pairType, setPairType] = useState<PairType>('normal')
  const [startNodeId, setStartNodeId] = useState('')
  const [endNodeId, setEndNodeId] = useState('')
  const [name, setName] = useState('')
  const [enabled, setEnabled] = useState(true)

  const nodesWithRoi = useMemo(() => {
    const roiNodeIds = new Set(rois.map((roi) => roi.nodeId))
    return nodes.filter(
      (node) => node.cameraId !== null && roiNodeIds.has(node.id),
    )
  }, [nodes, rois])

  const startOptions = useMemo(
    () =>
      nodesWithRoi
        .filter((node) => node.kind === 'start')
        .map((node) => ({
          label: `${getNodeDisplayName(node)} (${node.id})`,
          value: node.id,
        })),
    [nodesWithRoi],
  )
  const endOptions = useMemo(
    () =>
      nodesWithRoi
        .filter((node) => node.kind === 'end')
        .map((node) => ({
          label: `${getNodeDisplayName(node)} (${node.id})`,
          value: node.id,
        })),
    [nodesWithRoi],
  )

  useEffect(() => {
    if (!open) {
      return
    }
    setPairType('normal')
    setStartNodeId(startOptions[0]?.value ?? '')
    setEndNodeId(endOptions[0]?.value ?? '')
    setName('')
    setEnabled(true)
  }, [open, startOptions, endOptions])

  const canSubmit =
    canWriteConfig &&
    startNodeId !== '' &&
    (pairType === 'empty' || endNodeId !== '')

  const handleSubmit = () => {
    if (!canSubmit) {
      return
    }
    createPair.mutate(
      {
        startNodeId,
        pairType,
        enabled,
        ...(pairType === 'normal' ? { endNodeId } : {}),
        ...(name.trim() ? { name: name.trim() } : {}),
      },
      { onSuccess: onClose },
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-md gap-3">
        <DialogHeader>
          <DialogTitle className="text-sm">Add pair</DialogTitle>
        </DialogHeader>

        {!canWriteConfig ? (
          <p className="text-[11px] text-warning">{gateMessage}</p>
        ) : null}

        {startOptions.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">
            No start node with ROI — draw ROI before creating a pair.
          </p>
        ) : null}

        <FilterSelect
          label="Pair type"
          value={pairType}
          options={PAIR_TYPE_OPTIONS}
          onChange={(value) => setPairType(value as PairType)}
        />
        <FilterSelect
          label="Start node (has ROI)"
          value={startNodeId}
          options={startOptions}
          onChange={setStartNodeId}
        />
        {pairType === 'normal' ? (
          <FilterSelect
            label="End node (has ROI)"
            value={endNodeId}
            options={endOptions}
            onChange={setEndNodeId}
          />
        ) : (
          <p className="text-[10px] text-muted-foreground">
            Empty pair — no end node needed (`id` format start:_). Cross-zone OK.
          </p>
        )}
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Pair name (optional)"
          aria-label="Pair name"
          className="text-[11px]"
        />
        <label className="flex items-center gap-2 text-[11px]">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
          />
          enabled
        </label>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={createPair.isPending}
          >
            Cancel
          </Button>
          <Button
            disabled={!canSubmit || createPair.isPending}
            onClick={handleSubmit}
          >
            {createPair.isPending ? 'Creating…' : 'Create pair'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
