import { useMutation, useQueryClient } from '@tanstack/react-query'

import { env } from '@/config/env'
import { mapKeys } from '@/features/maps/api/map-keys'
import type { ImportMapResult } from '@/features/maps/types'
import { apiClient } from '@/lib/axios'
import { mockRequest } from '@/testing/mock-request'
import {
  mapVersionFixtures,
} from '@/testing/fixtures/maps'
import type { ApiError } from '@/types'

async function importMap(file: File): Promise<ImportMapResult> {
  if (env.useMockApi) {
    const name = file.name.toLowerCase()
    if (!name.endsWith('.zip')) {
      const error: ApiError = {
        status: 400,
        message: 'Không phải file zip',
      }
      throw error
    }

    const versionId = `map-v-${Date.now()}`
    mapVersionFixtures.forEach((item) => {
      item.isActive = false
    })
    mapVersionFixtures.unshift({
      versionId,
      originalFilename: file.name,
      byteSize: file.size,
      checksum: `sha256-mock-${versionId}`,
      createdAt: new Date().toISOString(),
      createdBy: 'admin',
      isActive: true,
    })

    while (mapVersionFixtures.length > 5) {
      const oldest = [...mapVersionFixtures]
        .reverse()
        .find((item) => !item.isActive)
      if (!oldest) break
      const index = mapVersionFixtures.findIndex(
        (item) => item.versionId === oldest.versionId,
      )
      if (index >= 0) mapVersionFixtures.splice(index, 1)
    }

    return mockRequest(
      {
        versionId,
        isActive: true,
        pruned: [],
        byteSize: file.size,
        checksum: `sha256-mock-${versionId}`,
      },
      400,
    )
  }

  const formData = new FormData()
  formData.append('file', file)

  const { data } = await apiClient.post<ImportMapResult>(
    '/maps/import_map',
    formData,
    {
      // Để browser/axios gắn boundary — không ép application/json mặc định.
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120_000,
      transformRequest: [
        (body, headers) => {
          if (body instanceof FormData) {
            delete headers['Content-Type']
          }
          return body
        },
      ],
    },
  )
  return data
}

export function useImportMap() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: importMap,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mapKeys.all })
    },
  })
}
