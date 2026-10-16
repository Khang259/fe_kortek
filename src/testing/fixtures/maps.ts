import type {
  CompressPayload,
  GetCompressResponse,
  ListMapVersionsResponse,
  MapVersion,
} from '@/features/maps/types'

export const ACTIVE_MAP_VERSION_ID = 'map-v-demo-1'

export const mapVersionFixtures: MapVersion[] = [
  {
    versionId: ACTIVE_MAP_VERSION_ID,
    originalFilename: '0805.zip',
    byteSize: 1_234_567,
    checksum: 'sha256-demo-1',
    createdAt: '2024-06-12T08:00:00Z',
    createdBy: 'admin',
    isActive: true,
  },
  {
    versionId: 'map-v-demo-0',
    originalFilename: 'legacy.zip',
    byteSize: 900_000,
    checksum: 'sha256-demo-0',
    createdAt: '2024-05-01T08:00:00Z',
    createdBy: 'admin',
    isActive: false,
  },
]

/** Compress nhỏ để mock vẽ được trên Node map. */
export const compressFixture: CompressPayload = {
  nodeKeys: [
    'x',
    'y',
    'type',
    'kind',
    'content',
    'name',
    'zone',
    'camera',
    'pairPoint',
  ],
  nodeArr: [
    // type 0 — ẩn
    [15_000, 15_000, 0, 'waypoint', 'hidden-qr', 'hidden-qr', 'X', 'Cam9', ''],
    // type 1 — hiện; `name` = tên thật (không S-01 tạm)
    [20_000, 20_000, 1, 'start', 'A1', 'A1', 'X', 'Cam9', 'Line1'],
    [80_000, 20_000, 1, 'end', 'Line1', 'Line1', 'X', 'Cam15', 'A1'],
    [20_000, 60_000, 1, 'start', 'B1', 'B1', 'X', 'Cam9', 'Line1'],
    [80_000, 60_000, 1, 'end', 'Line2', 'Line2', 'X', 'Cam16', 'C1'],
    [50_000, 40_000, 1, 'waypoint', 'C1', 'C1', 'X', 'Cam8', 'Line2'],
    // Camera markers
    [35_000, 25_000, 1, 'camera', '', 'Cam9', 'X', '', ''],
    [65_000, 55_000, 1, 'camera', '', 'Cam8', 'X', '', ''],
  ],
  lineKeys: [
    'from',
    'to',
    'leftWidth',
    'rightWidth',
    'startExpandDistance',
    'endExpandDistance',
    'path',
  ],
  lineArr: [
    ['A1', 'Line1', 600, 600, 0, 0, [[20_000, 20_000], [80_000, 20_000]]],
    ['B1', 'Line2', 600, 600, 0, 0, [[20_000, 60_000], [80_000, 60_000]]],
    [
      'A1',
      'C1',
      600,
      600,
      0,
      0,
      [
        [20_000, 20_000],
        [50_000, 40_000],
      ],
    ],
    [
      'C1',
      'Line2',
      600,
      600,
      0,
      0,
      [
        [50_000, 40_000],
        [80_000, 60_000],
      ],
    ],
  ],
  width: 100_000,
  height: 80_000,
  xAttrMin: 10_000,
  yAttrMin: 10_000,
}

export const compressResponseFixture: GetCompressResponse = {
  versionId: ACTIVE_MAP_VERSION_ID,
  compress: compressFixture,
}

export function listMapVersionsFixture(): ListMapVersionsResponse {
  const active = mapVersionFixtures.find((item) => item.isActive)
  return {
    activeVersionId: active?.versionId ?? null,
    items: mapVersionFixtures.map((item) => ({ ...item })),
  }
}
