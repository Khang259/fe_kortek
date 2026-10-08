import { useMemo } from 'react'
import { toast } from 'sonner'

import { PERMISSIONS } from '@/config/permissions'
import { useUpdateNode } from '@/features/nodes'
import { useNodes } from '@/features/nodes/api/get-nodes'
import { usePriorityEditorStore } from '@/features/priority/stores/priority-editor-store'
import { useConfigWriteGate } from '@/features/system/hooks/use-config-write-gate'
import { useZones } from '@/features/zones'
import { useHasPermission } from '@/hooks/use-has-permission'
import type { WarehouseNode } from '@/types'

function sortStarts(nodes: WarehouseNode[]) {
  return [...nodes].sort((a, b) => {
    if (a.zoneId !== b.zoneId) return a.zoneId.localeCompare(b.zoneId)
    if (a.priority !== b.priority) return a.priority - b.priority
    return a.id.localeCompare(b.id)
  })
}

/** Editor priority: trái = zone đầu, phải = các zone còn lại → PATCH update_node. */
export function usePriorityEditor() {
  const { data: nodes = [], isPending, isError } = useNodes()
  const { data: zones = [] } = useZones()
  const canWrite = useHasPermission(PERMISSIONS.cameraWrite)
  const { canWriteConfig, gateMessage } = useConfigWriteGate()
  const updateNode = useUpdateNode()

  const isEditing = usePriorityEditorStore((state) => state.isEditing)
  const drafts = usePriorityEditorStore((state) => state.drafts)
  const enterEdit = usePriorityEditorStore((state) => state.enterEdit)
  const exitEdit = usePriorityEditorStore((state) => state.exitEdit)
  const patchDraft = usePriorityEditorStore((state) => state.patchDraft)

  const sortedZones = useMemo(
    () => [...zones].sort((a, b) => a.id.localeCompare(b.id)),
    [zones],
  )

  /** Zone cố định bên trái (zone đầu theo id). */
  const primaryZone = sortedZones[0] ?? null
  const primaryZoneId = primaryZone?.id ?? ''

  const primaryStarts = useMemo(() => {
    if (!primaryZoneId) return []
    return sortStarts(
      nodes.filter(
        (node) => node.kind === 'start' && node.zoneId === primaryZoneId,
      ),
    )
  }, [nodes, primaryZoneId])

  /** Start thuộc mọi zone còn lại. */
  const remainingStarts = useMemo(() => {
    if (!primaryZoneId) {
      return sortStarts(nodes.filter((node) => node.kind === 'start'))
    }
    return sortStarts(
      nodes.filter(
        (node) => node.kind === 'start' && node.zoneId !== primaryZoneId,
      ),
    )
  }, [nodes, primaryZoneId])

  const remainingZoneLabel = useMemo(() => {
    const ids = sortedZones.slice(1).map((zone) => zone.id)
    if (ids.length === 0) return 'Other zones'
    return `Other zones (${ids.join(', ')})`
  }, [sortedZones])

  const editableStarts = useMemo(() => {
    const byId = new Map<string, WarehouseNode>()
    ;[...primaryStarts, ...remainingStarts].forEach((node) => {
      byId.set(node.id, node)
    })
    return [...byId.values()]
  }, [primaryStarts, remainingStarts])

  function startEdit() {
    if (!canWrite) {
      toast.error('Missing camera.write permission')
      return
    }
    if (!canWriteConfig) {
      toast.warning(gateMessage)
      return
    }
    enterEdit(editableStarts)
  }

  function cancelEdit() {
    exitEdit()
  }

  function saveEdit() {
    if (!canWrite) {
      toast.error('Missing camera.write permission')
      return
    }
    if (!canWriteConfig) {
      toast.warning(gateMessage)
      return
    }

    const byId = new Map(nodes.map((node) => [node.id, node]))
    const patches: { nodeId: string; priority: number }[] = []

    for (const [nodeId, draft] of Object.entries(drafts)) {
      const node = byId.get(nodeId)
      if (!node || node.kind !== 'start') continue
      if (!Number.isInteger(draft.priority) || draft.priority < 0) {
        toast.error(`priority must be >= 0 (${nodeId})`)
        return
      }
      if (draft.priority === node.priority) continue
      patches.push({ nodeId, priority: draft.priority })
    }

    if (patches.length === 0) {
      exitEdit()
      return
    }

    /** Unique priority theo từng zone (không theo panel). */
    const finalByZone = new Map<string, Map<number, string>>()
    for (const node of nodes) {
      if (node.kind !== 'start') continue
      const priority = drafts[node.id]?.priority ?? node.priority
      const zoneMap = finalByZone.get(node.zoneId) ?? new Map()
      if (zoneMap.has(priority)) {
        toast.error(
          `priority ${priority} duplicated in zone ${node.zoneId}`,
        )
        return
      }
      zoneMap.set(priority, node.id)
      finalByZone.set(node.zoneId, zoneMap)
    }

    void (async () => {
      try {
        for (const patch of patches) {
          await updateNode.mutateAsync(patch)
        }
        exitEdit()
      } catch {
        /* mutation toast / isError */
      }
    })()
  }

  return {
    primaryZone,
    primaryZoneId,
    primaryStarts,
    remainingStarts,
    remainingZoneLabel,
    isEditing,
    drafts,
    patchDraft,
    isPending,
    isError,
    isSaving: updateNode.isPending,
    canWrite,
    canWriteConfig,
    startEdit,
    cancelEdit,
    saveEdit,
  }
}
