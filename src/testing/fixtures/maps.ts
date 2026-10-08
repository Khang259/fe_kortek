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
    [15_000, 15_000, 0, 'waypoint', 'hidden-qr', 'hidden-qr', 'AE5', 'Cam-1', ''],
    // type 1 — hiện; `name` = tên thật (không S-01 tạm)
    [20_000, 20_000, 1, 'start', 'QR-S01', 'QR-S01', 'AE5', 'Cam-1', 'QR-E01'],
    [80_000, 20_000, 1, 'end', 'QR-E01', 'QR-E01', 'AE5', 'Cam-1', 'QR-S01'],
    [20_000, 60_000, 1, 'start', 'QR-S02', 'QR-S02', 'AE5', 'Cam-2', 'QR-E02'],
    [80_000, 60_000, 1, 'end', 'QR-E02', 'QR-E02', 'AE5', 'Cam-2', 'QR-S02'],
    [50_000, 40_000, 1, 'waypoint', 'QR-W01', 'QR-W01', 'BF2', 'Cam-4', 'QR-S04'],
    // Camera markers
    [35_000, 25_000, 1, 'camera', '', 'Cam-1', 'AE5', '', ''],
    [65_000, 55_000, 1, 'camera', '', 'Cam-3', 'AE5', '', ''],
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
    ['QR-S01', 'QR-E01', 600, 600, 0, 0, [[20_000, 20_000], [80_000, 20_000]]],
    ['QR-S02', 'QR-E02', 600, 600, 0, 0, [[20_000, 60_000], [80_000, 60_000]]],
    [
      'QR-S01',
      'QR-W01',
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
      'QR-W01',
      'QR-E02',
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
