import { useSearchParams } from 'react-router'

import { FilterSelect } from '@/components/common/filter-select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FILTER_ALL } from '@/config/constants'
import { LogPayloadDialog } from '@/features/logs/components/log-payload-dialog'
import { LogTimeFilter } from '@/features/logs/components/log-time-filter'
import { SystemActionLogTable } from '@/features/logs/components/system-action-log-table'
import { UserActionLogTable } from '@/features/logs/components/user-action-log-table'
import { useLogFilterStore } from '@/features/logs/stores/log-filter-store'
import {
  actionResultLabels,
  systemActionLabels,
} from '@/features/logs/utils/log-result'

const SUB_TABS = [
  { label: 'System', value: 'system' },
  { label: 'User', value: 'user' },
]

const resultOptions = [
  { label: 'All results', value: FILTER_ALL },
  ...Object.entries(actionResultLabels).map(([value, label]) => ({
    label,
    value,
  })),
]

const actionOptions = [
  { label: 'All actions', value: FILTER_ALL },
  ...Object.entries(systemActionLabels).map(([value, label]) => ({
    label,
    value,
  })),
]

export function ActionLogsPage() {
  /**
   * Tab con nằm trong query param để link chia sẻ được và reload không mất.
   * Không dùng useState vì log thường được gửi cho người khác xem.
   */
  const [searchParams, setSearchParams] = useSearchParams()
  const type = searchParams.get('type') === 'user' ? 'user' : 'system'

  const result = useLogFilterStore((state) => state.result)
  const setResult = useLogFilterStore((state) => state.setResult)
  const action = useLogFilterStore((state) => state.action)
  const setAction = useLogFilterStore((state) => state.setAction)
  const setPage = useLogFilterStore((state) => state.setPage)

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={type}
          onValueChange={(value) => {
            setSearchParams({ type: String(value) }, { replace: true })
            /** Hai bảng dùng chung state phân trang nên phải về trang 1. */
            setPage(1)
          }}
        >
          <TabsList>
            {SUB_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-[11px]"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex flex-wrap items-center gap-3">
          <LogTimeFilter />
          {type === 'system' ? (
            <>
              <FilterSelect
                label="Action"
                value={action}
                options={actionOptions}
                onChange={setAction}
                className="h-7 min-w-36 text-[10px]"
              />
              <FilterSelect
                label="Result"
                value={result}
                options={resultOptions}
                onChange={setResult}
                className="h-7 min-w-32 text-[10px]"
              />
            </>
          ) : null}
        </div>
      </div>

      {type === 'system' ? <SystemActionLogTable /> : <UserActionLogTable />}

      <LogPayloadDialog />
    </div>
  )
}
