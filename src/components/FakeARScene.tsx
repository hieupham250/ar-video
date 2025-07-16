import { useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useVideoStreamTexture } from "../hooks/useVideoStreamTexture";
import { useTouchRotation } from "../hooks/useTouchRotation";

export default function FakeARScene({ videoId }: { videoId: number }) {
  const { scene } = useThree();
  const [cameraTexture, setCameraTexture] = useState<THREE.VideoTexture | null>(
    null
  );
  const meshRef = useRef<THREE.Mesh | null>(null);
  const textureRef = useVideoStreamTexture(videoId);
  const userRotation = useTouchRotation(Math.PI / 4);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.x = userRotation.current.x;
      meshRef.current.rotation.y = userRotation.current.y;
    }
  });

  useEffect(() => {
    async function getCameraStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        const camVideo = document.createElement("video");
        camVideo.srcObject = stream;
        camVideo.play();
        camVideo.muted = true;
        camVideo.setAttribute("playsinline", "true");

        const texture = new THREE.VideoTexture(camVideo);
        setCameraTexture(texture);
      } catch (err) {
        console.error("Không thể truy cập camera:", err);
      }
    }

    getCameraStream();
  }, []);

  useEffect(() => {
    if (cameraTexture) {
      scene.background = cameraTexture;
    }
    return () => {
      scene.background = null;
    };
  }, [cameraTexture, scene]);

  if (!textureRef.current) return null;

  return (
    <mesh ref={meshRef} position={[0, 1.5, -2]}>
      <planeGeometry args={[3, 2]} />
      <meshBasicMaterial
        map={textureRef.current ?? undefined}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
