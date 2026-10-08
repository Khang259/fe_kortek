/**
 * Giả lập một lần gọi network để React Query có đủ vòng đời
 * pending → success. Khi có backend thật thì thay bằng apiClient.get().
 */
export function mockRequest<TData>(data: TData, delayMs = 260): Promise<TData> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delayMs)
  })
}
