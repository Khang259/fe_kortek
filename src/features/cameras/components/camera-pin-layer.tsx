import { useMappedCameras } from '@/features/cameras/api/get-cameras'
import { CameraPin } from '@/features/cameras/components/camera-pin'

/** Overlay camera cho node map. Dashboard truyền component này vào NodeMap. */
export function CameraPinLayer() {
  const { data: cameras = [] } = useMappedCameras()

  return (
    <>
      {cameras.map((camera) => (
        <CameraPin key={camera.id} camera={camera} />
      ))}
    </>
  )
}
