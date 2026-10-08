import { Trash2 } from 'lucide-react'

import { FilterSelect, type FilterOption } from '@/components/common/filter-select'
import { Button } from '@/components/ui/button'
import type { RoiDraft } from '@/features/cameras/types'
import { formatRoiBox } from '@/features/cameras/utils/camera-status'

interface RoiDraftRowProps {
  draft: RoiDraft
  index: number
  nodeOptions: FilterOption[]
  disabled?: boolean
  onNodeChange: (nodeId: string) => void
  onRemove: () => void
}

export function RoiDraftRow({
  draft,
  index,
  nodeOptions,
  disabled = false,
  onNodeChange,
  onRemove,
}: RoiDraftRowProps) {
  return (
    <div className="flex items-center gap-2 border-b px-2.5 py-1.5 last:border-b-0">
      <span className="w-10 text-[10px] font-semibold">#{index + 1}</span>
      <span className="flex-1 font-mono text-[10px] text-muted-foreground">
        {formatRoiBox(draft.box)}
      </span>
      {disabled ? (
        <span className="min-w-28 text-[10px] text-muted-foreground">
          {nodeOptions.find((option) => option.value === draft.nodeId)?.label ??
            (draft.nodeId || '—')}
        </span>
      ) : (
        <FilterSelect
          label={`Node for ROI ${index + 1}`}
          value={draft.nodeId || '__pick__'}
          options={[
            { label: 'Select node…', value: '__pick__' },
            ...nodeOptions,
          ]}
          onChange={(nodeId) => {
            if (nodeId === '__pick__') return
            onNodeChange(nodeId)
          }}
          className="h-7 min-w-28 text-[10px]"
        />
      )}
      <Button
        variant="destructive"
        size="icon-xs"
        aria-label={`Delete ROI ${index + 1}`}
        disabled={disabled}
        onClick={onRemove}
      >
        <Trash2 />
      </Button>
    </div>
  )
}
