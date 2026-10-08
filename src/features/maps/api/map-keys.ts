export const mapKeys = {
  all: ['maps'] as const,
  versions: () => [...mapKeys.all, 'versions'] as const,
  compress: (versionId?: string) =>
    [...mapKeys.all, 'compress', versionId ?? 'active'] as const,
}
