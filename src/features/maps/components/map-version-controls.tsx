import { Download, FileArchive, RotateCcw } from 'lucide-react'
import { useRef } from 'react'

import { FilterSelect } from '@/components/common/filter-select'
import { Button } from '@/components/ui/button'
import { PERMISSIONS } from '@/config/permissions'
import { useDownloadMapZip } from '@/features/maps/api/download-map-zip'
import { useImportMap } from '@/features/maps/api/import-map'
import { useMapVersions } from '@/features/maps/api/list-map-versions'
import { useSetActiveMap } from '@/features/maps/api/set-active-map'
import { useHasPermission } from '@/hooks/use-has-permission'

/**
 * Thanh quản lý version map: chọn bản, restore, tải zip, import (map.write).
 */
export function MapVersionControls() {
  const inputRef = useRef<HTMLInputElement>(null)
  const canRead = useHasPermission(PERMISSIONS.mapRead)
  const canWrite = useHasPermission(PERMISSIONS.mapWrite)

  const { data, isPending } = useMapVersions(canRead)
  const importMap = useImportMap()
  const setActive = useSetActiveMap()
  const downloadZip = useDownloadMapZip()

  if (!canRead) {
    return (
      <span className="text-[10px] text-faint">Missing map.read permission</span>
    )
  }

  const versions = data?.items ?? []
  const activeId = data?.activeVersionId ?? ''
  const options = versions.map((item) => ({
    label: `${item.isActive ? '● ' : ''}${item.originalFilename}`,
    value: item.versionId,
  }))

  const selected =
    versions.find((item) => item.versionId === activeId)?.versionId ??
    options[0]?.value ??
    ''

  return (
    <div
      data-map-no-pan
      className="flex flex-wrap items-center gap-1.5"
    >
      {options.length > 0 ? (
        <FilterSelect
          label="Map version"
          value={selected}
          options={options}
          onChange={(versionId) => {
            if (versionId === activeId) return
            setActive.mutate(versionId)
          }}
          className="h-7 min-w-36 text-[10px]"
        />
      ) : (
        <span className="text-[10px] text-faint">
          {isPending ? 'Loading versions…' : 'No map yet'}
        </span>
      )}

      <Button
        variant="outline"
        size="xs"
        disabled={!selected || downloadZip.isPending}
        title="Download original zip"
        onClick={() => downloadZip.mutate(selected || undefined)}
      >
        <Download />
        Download zip
      </Button>

      {canWrite ? (
        <>
          <input
            ref={inputRef}
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            className="sr-only"
            aria-label="Import map zip"
            onChange={(event) => {
              const file = event.target.files?.[0]
              if (file) {
                importMap.mutate(file)
              }
              event.target.value = ''
            }}
          />
          <Button
            variant="outline"
            size="xs"
            disabled={importMap.isPending}
            onClick={() => inputRef.current?.click()}
          >
            <FileArchive />
            {importMap.isPending ? 'Importing…' : 'Import zip'}
          </Button>
        </>
      ) : null}

      {setActive.isPending ? (
        <span className="flex items-center gap-1 text-[10px] text-faint">
          <RotateCcw className="size-3 animate-spin" />
          Switching active version…
        </span>
      ) : null}
    </div>
  )
}
