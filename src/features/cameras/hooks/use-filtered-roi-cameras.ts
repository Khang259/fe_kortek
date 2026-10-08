import { useMemo } from 'react'

import { FILTER_ALL } from '@/config/constants'
import { useCameraRois } from '@/features/cameras/api/get-camera-rois'
import { useCameras } from '@/features/cameras/api/get-cameras'
import { useRoiFilterStore } from '@/features/cameras/stores/roi-filter-store'
import type { Camera, CameraRoi } from '@/features/cameras/types'
import { buildListPagination } from '@/lib/list-pagination'
import { useDebounce } from '@/hooks/use-debounce'
import { useNodes } from '@/features/nodes'
import { getNodeDisplayName } from '@/features/nodes/utils/node-display-name'

function cameraMatches(
  camera: Camera,
  cameraKeyword: string,
  zone: string,
  nodeKeyword: string,
  rois: CameraRoi[],
  nodeLabelById: Record<string, string>,
) {
  if (zone !== FILTER_ALL && camera.zone !== zone) {
    return false
  }
  if (
    cameraKeyword &&
    !`${camera.name} ${camera.cameraId}`.toLowerCase().includes(cameraKeyword)
  ) {
    return false
  }
  if (!nodeKeyword) {
    return true
  }

  const relatedNodeIds = new Set([
    ...camera.observedNodeIds,
    ...rois
      .filter((roi) => roi.cameraId === camera.cameraId)
      .map((roi) => roi.nodeId),
  ])

  return [...relatedNodeIds].some((nodeId) => {
    const label = nodeLabelById[nodeId] ?? ''
    return (
      nodeId.toLowerCase().includes(nodeKeyword) ||
      label.toLowerCase().includes(nodeKeyword)
    )
  })
}

/** Lọc + phân trang client-side bảng ROI config. */
export function useFilteredRoiCameras() {
  const camerasQuery = useCameras()
  const { data: rois = [] } = useCameraRois()
  const { data: nodes = [] } = useNodes()

  const cameraSearch = useRoiFilterStore((state) => state.cameraSearch)
  const zone = useRoiFilterStore((state) => state.zone)
  const nodeSearch = useRoiFilterStore((state) => state.nodeSearch)
  const page = useRoiFilterStore((state) => state.page)
  const pageSize = useRoiFilterStore((state) => state.pageSize)
  const setPage = useRoiFilterStore((state) => state.setPage)
  const setPageSize = useRoiFilterStore((state) => state.setPageSize)

  const debouncedCamera = useDebounce(cameraSearch)
  const debouncedNode = useDebounce(nodeSearch)

  const filtered = useMemo(() => {
    const cameraKeyword = debouncedCamera.trim().toLowerCase()
    const nodeKeyword = debouncedNode.trim().toLowerCase()
    const nodeLabelById = Object.fromEntries(
      nodes.map((node) => [node.id, getNodeDisplayName(node)]),
    )

    return (camerasQuery.data ?? []).filter((camera) =>
      cameraMatches(
        camera,
        cameraKeyword,
        zone,
        nodeKeyword,
        rois,
        nodeLabelById,
      ),
    )
  }, [camerasQuery.data, debouncedCamera, debouncedNode, nodes, rois, zone])

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
    rois,
    pagination,
    isPending: camerasQuery.isPending,
    isError: camerasQuery.isError,
  }
}
