import { useXRHitTest } from "@react-three/xr";
import Hls from "hls.js";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ARScene() {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const tempMatrix = new THREE.Matrix4();

  useEffect(() => {
    let video: HTMLVideoElement;
    video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute("webkit-playsinline", "true");

    if (Hls.isSupported()) {
      const hls = new Hls({
        autoStartLoad: true,
        startLevel: -1,
        capLevelToPlayerSize: false,
        abrEwmaDefaultEstimate: 10000000,
        maxBufferLength: 30,
        maxMaxBufferLength: 60,
        fragLoadingRetryDelay: 500,
        manifestLoadingMaxRetry: 6,
        levelLoadingMaxRetry: 6,
        fragLoadingMaxRetry: 6,
      });
      hls.loadSource(
        "https://stream.mux.com/N5pbU5pzg9LmtOXfOq25yffKEsK2V4j29gMwYTSNWJ4.m3u8"
      );
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src =
        "https://stream.mux.com/N5pbU5pzg9LmtOXfOq25yffKEsK2V4j29gMwYTSNWJ4.m3u8";
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
    }
    videoRef.current = video;
    textureRef.current = new THREE.VideoTexture(video);
  }, []);

  useXRHitTest((hitTestResults, getHitPoseMatrix) => {
    if (!meshRef.current) return;

    const hit = hitTestResults[0];
    const mesh = meshRef.current;

    if (hit && mesh) {
      const maxtrix = getHitPoseMatrix(tempMatrix, hit);

      if (maxtrix) {
        meshRef.current.visible = true;

        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        tempMatrix.decompose(position, quaternion, scale);

        meshRef.current.position.copy(position);
        meshRef.current.quaternion.copy(quaternion);
        meshRef.current.scale.copy(scale);
      } else {
        mesh.visible = false;
      }
    } else if (mesh) {
      mesh.visible = false;
    }
  }, "viewer");

  return (
    <mesh ref={meshRef} visible={false}>
      <planeGeometry args={[0.13, 0.09]} />
      <meshBasicMaterial
        map={textureRef.current ?? undefined}
        toneMapped={false}
      />
    </mesh>
  );
}
