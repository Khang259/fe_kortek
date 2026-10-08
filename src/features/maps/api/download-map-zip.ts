import { useMutation } from '@tanstack/react-query'

import { env } from '@/config/env'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'
import {
  ACTIVE_MAP_VERSION_ID,
  mapVersionFixtures,
} from '@/testing/fixtures/maps'

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

async function downloadMapZip(versionId?: string) {
  if (env.useMockApi) {
    const version =
      mapVersionFixtures.find((item) => item.versionId === versionId) ??
      mapVersionFixtures.find((item) => item.isActive) ??
      mapVersionFixtures[0]
    const blob = new Blob([`mock-zip:${version?.versionId ?? ACTIVE_MAP_VERSION_ID}`], {
      type: 'application/zip',
    })
    await mockRequest(undefined, 200)
    triggerBlobDownload(
      blob,
      version?.originalFilename ?? 'map.zip',
    )
    return
  }

  const response = await apiClient.get<Blob>('/maps/download_map_zip', {
    params: versionId ? { versionId } : undefined,
    responseType: 'blob',
    timeout: 120_000,
  })

  const disposition = response.headers['content-disposition'] as
    | string
    | undefined
  const match = disposition?.match(/filename="?([^"]+)"?/i)
  const filename = match?.[1] ?? 'map.zip'
  triggerBlobDownload(response.data, filename)
}

export function useDownloadMapZip() {
  return useMutation({
    mutationFn: (versionId?: string) => downloadMapZip(versionId),
    meta: { skipToast: true },
  })
}
