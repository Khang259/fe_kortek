/** Format response chuẩn của backend. */
export interface ApiResponse<TData> {
  data: TData
  message?: string
}

export interface PaginatedResponse<TItem> {
  items: TItem[]
  total: number
  page: number
  pageSize: number
}

/** Lỗi đã được chuẩn hoá bởi interceptor của axios. */
export interface ApiError {
  status: number
  message: string
}
