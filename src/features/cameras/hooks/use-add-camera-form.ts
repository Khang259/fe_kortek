import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { useCreateCamera } from '@/features/cameras/api/create-camera'
import { useNodes } from '@/features/nodes'
import {
  isStartNodeId,
  suggestNextStartPriority,
  usedStartPrioritiesInZone,
} from '@/features/nodes/utils/node-priority'
import { useConfigWriteGate } from '@/features/system/hooks/use-config-write-gate'
import { useZones } from '@/features/zones'

export const ZONE_NONE = '__none__'

export function useAddCameraForm(onClose: () => void) {
  const { data: zones = [] } = useZones()
  const { data: nodes = [] } = useNodes()
  const createCamera = useCreateCamera()
  const { canWriteConfig, gateMessage } = useConfigWriteGate()

  const [name, setName] = useState('')
  const [rtspUrl, setRtspUrl] = useState('')
  const [zone, setZone] = useState(ZONE_NONE)
  const [nodeIdDraft, setNodeIdDraft] = useState('')
  const [startPriorities, setStartPriorities] = useState<
    Record<string, string>
  >({})

  const zoneOptions = useMemo(
    () => [
      { label: 'None', value: ZONE_NONE },
      ...zones.map((item) => ({ label: item.name, value: item.id })),
    ],
    [zones],
  )

  const observedNodeIds = useMemo(
    () =>
      nodeIdDraft
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    [nodeIdDraft],
  )

  const newStartIds = useMemo(
    () =>
      observedNodeIds.filter(
        (id) => isStartNodeId(id) && !nodes.some((node) => node.id === id),
      ),
    [observedNodeIds, nodes],
  )

  /** Gợi ý priority khi thêm start mới / đổi zone. */
  useEffect(() => {
    if (zone === ZONE_NONE || newStartIds.length === 0) {
      return
    }
    setStartPriorities((prev) => {
      const next = { ...prev }
      const reserved = new Set<number>()
      Object.entries(next).forEach(([id, raw]) => {
        if (!newStartIds.includes(id)) {
          return
        }
        const value = Number(raw)
        if (Number.isInteger(value) && value >= 0) {
          reserved.add(value)
        }
      })
      const used = usedStartPrioritiesInZone(nodes, zone)
      newStartIds.forEach((id) => {
        if (next[id] !== undefined && next[id] !== '') {
          return
        }
        let guess = suggestNextStartPriority(nodes, zone)
        while (used.has(guess) || reserved.has(guess)) {
          guess += 1
        }
        reserved.add(guess)
        next[id] = String(guess)
      })
      Object.keys(next).forEach((id) => {
        if (!newStartIds.includes(id)) {
          delete next[id]
        }
      })
      return next
    })
  }, [newStartIds, zone, nodes])

  const needsZoneForNodes = observedNodeIds.length > 0 && zone === ZONE_NONE

  const priorityError = useMemo(() => {
    if (newStartIds.length === 0 || zone === ZONE_NONE) {
      return null
    }
    const used = usedStartPrioritiesInZone(nodes, zone)
    const batch = new Set<number>()
    for (const id of newStartIds) {
      const raw = startPriorities[id]
      const value = Number(raw)
      if (
        raw === undefined ||
        raw === '' ||
        !Number.isInteger(value) ||
        value < 0
      ) {
        return `Start ${id} needs priority >= 0`
      }
      if (used.has(value) || batch.has(value)) {
        return `priority ${value} already used in Zone ${zone}`
      }
      batch.add(value)
    }
    return null
  }, [newStartIds, startPriorities, zone, nodes])

  const canSubmit =
    canWriteConfig &&
    name.trim() !== '' &&
    rtspUrl.trim().startsWith('rtsp://') &&
    !needsZoneForNodes &&
    !priorityError

  const nodePlaceholder =
    nodes.find((node) => zone === ZONE_NONE || node.zoneId === zone)?.id ??
    'start_…'

  const reset = () => {
    setName('')
    setRtspUrl('')
    setZone(ZONE_NONE)
    setNodeIdDraft('')
    setStartPriorities({})
  }

  const handleSubmit = () => {
    if (!canSubmit) {
      return
    }

    const nodePriorities: Record<string, number> = {}
    newStartIds.forEach((id) => {
      nodePriorities[id] = Number(startPriorities[id])
    })

    createCamera.mutate(
      {
        name,
        rtspUrl,
        ...(zone !== ZONE_NONE ? { zone } : {}),
        ...(observedNodeIds.length > 0 ? { observedNodeIds } : {}),
        ...(Object.keys(nodePriorities).length > 0
          ? { nodePriorities }
          : {}),
      },
      {
        onSuccess: (result) => {
          if (result.requiresRestart) {
            toast.warning(
              'New camera needs a runtime reload to receive the stream (runtime/reload).',
            )
          }
          reset()
          onClose()
        },
      },
    )
  }

  return {
    canWriteConfig,
    gateMessage,
    name,
    setName,
    rtspUrl,
    setRtspUrl,
    zone,
    setZone,
    zoneOptions,
    nodeIdDraft,
    setNodeIdDraft,
    nodePlaceholder,
    newStartIds,
    startPriorities,
    setStartPriorities,
    needsZoneForNodes,
    priorityError,
    canSubmit,
    isPending: createCamera.isPending,
    handleSubmit,
  }
}
