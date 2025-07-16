import { useRef } from "react";
import { useXRHitTest } from "@react-three/xr";
import * as THREE from "three";
import { useVideoStreamTexture } from "../hooks/useVideoStreamTexture";
import { useTouchRotation } from "../hooks/useTouchRotation";

export default function ARScene({ videoId }: { videoId: number }) {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const textureRef = useVideoStreamTexture(videoId);
  const userRotation = useTouchRotation(Math.PI / 3);
  const tempMatrix = new THREE.Matrix4();

  useXRHitTest((hitTestResults, getHitPoseMatrix) => {
    const mesh = meshRef.current;
    const hit = hitTestResults[0];

    if (!mesh) return;

    if (hit) {
      const matrix = getHitPoseMatrix(tempMatrix, hit);
      if (matrix) {
        mesh.visible = true;

        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        tempMatrix.decompose(position, quaternion, scale);

        mesh.position.copy(position);
        mesh.quaternion.copy(quaternion);
        mesh.scale.copy(scale);

        mesh.rotation.x += userRotation.current.x;
        mesh.rotation.y += userRotation.current.y;
      } else {
        mesh.visible = false;
      }
    } else {
      mesh.visible = false;
    }
  }, "viewer");

  if (!textureRef.current) return null;

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[0.13, 0.09]} />
      <meshBasicMaterial
        map={textureRef.current ?? undefined}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
