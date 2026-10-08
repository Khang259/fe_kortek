interface JsonBlockProps {
  data: unknown
}

/** Hiển thị payload JSON đã format để operator đọc và trích dẫn khi báo lỗi. */
export function JsonBlock({ data }: JsonBlockProps) {
  if (data === null || data === undefined) {
    return (
      <p className="rounded-md border bg-surface-overlay p-2.5 text-[10px] text-faint">
        No data
      </p>
    )
  }

  return (
    <pre className="max-h-64 overflow-auto rounded-md border bg-surface-overlay p-2.5 font-mono text-[10px] leading-relaxed whitespace-pre-wrap text-muted-foreground">
      {JSON.stringify(data, null, 2)}
    </pre>
  )
}
