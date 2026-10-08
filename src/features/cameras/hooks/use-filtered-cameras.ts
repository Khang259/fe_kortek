import { useMemo } from 'react'

import { FILTER_ALL } from '@/config/constants'
import { useCameras } from '@/features/cameras/api/get-cameras'
import { useCameraFilterStore } from '@/features/cameras/stores/camera-filter-store'
import type { Camera } from '@/features/cameras/types'
import { buildListPagination } from '@/lib/list-pagination'
import { useDebounce } from '@/hooks/use-debounce'

const matchesSearch = (camera: Camera, keyword: string) =>
  `${camera.cameraId} ${camera.name} ${camera.rtspUrl} ${camera.zone} ${camera.format} ${camera.resolution}`
    .toLowerCase()
    .includes(keyword)

/** Lọc + phân trang client-side bảng Camera config. */
export function useFilteredCameras() {
  const query = useCameras()
  const search = useCameraFilterStore((state) => state.search)
  const zone = useCameraFilterStore((state) => state.zone)
  const status = useCameraFilterStore((state) => state.status)
  const page = useCameraFilterStore((state) => state.page)
  const pageSize = useCameraFilterStore((state) => state.pageSize)
  const setPage = useCameraFilterStore((state) => state.setPage)
  const setPageSize = useCameraFilterStore((state) => state.setPageSize)

  const debouncedSearch = useDebounce(search)

  const filtered = useMemo(() => {
    const keyword = debouncedSearch.trim().toLowerCase()

    return (query.data ?? []).filter(
      (camera) =>
        (keyword === '' || matchesSearch(camera, keyword)) &&
        (zone === FILTER_ALL || camera.zone === zone) &&
        (status === FILTER_ALL || camera.status === status),
    )
  }, [query.data, debouncedSearch, zone, status])

  const pagination = buildListPagination(
    filtered.length,
    page,
    pageSize,
    setPage,
    setPageSize,
  )

  const cameras = filtered.slice(pagination.startIndex, pagination.endIndex)

  return {
    cameras,
    pagination,
    isPending: query.isPending,
    isError: query.isError,
  }
}
