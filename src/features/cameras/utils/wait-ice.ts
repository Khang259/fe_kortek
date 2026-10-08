/**
 * Đợi ICE gathering xong hoặc hết timeout (LAN thường nhanh; WAN cần STUN).
 */
export function waitIceGatheringComplete(
  pc: RTCPeerConnection,
  timeoutMs = 2_000,
): Promise<void> {
  if (pc.iceGatheringState === 'complete') {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    const finish = () => {
      clearTimeout(timer)
      pc.removeEventListener('icegatheringstatechange', onChange)
      resolve()
    }

    const onChange = () => {
      if (pc.iceGatheringState === 'complete') {
        finish()
      }
    }

    const timer = setTimeout(finish, timeoutMs)
    pc.addEventListener('icegatheringstatechange', onChange)
  })
}
