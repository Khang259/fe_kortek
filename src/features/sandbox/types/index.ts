/** Node điều khiển detected trong sandbox (không phải runtime isReady). */
export interface SandboxNode {
  nodeId: string
  cameraId: number
  cameraEnabled: boolean
  /** State mong muốn FE đã đặt. */
  detected: boolean
}

/** Lệnh ICS giả — `seq` để đối chiếu thứ tự priority. */
export interface SandboxOrder {
  seq: number
  orderId: string
  taskPath: string[]
  /** ICS OrderStatus số (9 assigned, 6 running, …). */
  status: number
  sentAt: number
}

export type SandboxOrderStatusInput = 6 | 3 | 23

export interface SetSandboxNodeStateInput {
  nodeId: string
  detected: boolean
}

export interface SetSandboxOrderStatusInput {
  orderId: string
  status: SandboxOrderStatusInput
}
