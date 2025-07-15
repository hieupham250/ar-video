import { useXRHitTest } from "@react-three/xr";
import Hls from "hls.js";
import { useEffect, useRef } from "react";
import * as THREE from "three";

const videoList = [
  {
    id: 1,
    url: {
      m3u8: "https://stream.mux.com/w685KDdryJ9vyuciekeQGvY02CR84juk01bkSwml015EzE.m3u8",
      mp4: "https://res.cloudinary.com/dh775j9ez/video/upload/v1752461876/cat_r9kq1x.mp4",
    },
  },
  {
    id: 2,
    url: {
      m3u8: "https://stream.mux.com/eumbSSWMkta6EhrrVJBwhw7oeMy2XOhD500XGlDT9aGM.m3u8",
      mp4: "https://res.cloudinary.com/dh775j9ez/video/upload/v1752461874/dog_woox7i.mp4",
    },
  },
];

export default function ARScene({ videoId }: { videoId: number }) {
  const meshRef = useRef<THREE.Mesh | null>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const tempMatrix = new THREE.Matrix4();

  // lưu xoay của người dùng (bằng vuốt)
  const userRotation = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.visible = false;
    }

    const videoData = videoList.find((video) => video.id == videoId);
    if (!videoData) {
      console.error("Không tim thấy id: ", videoId);
      return;
    }

    let video: HTMLVideoElement = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute("webkit-playsinline", "true");

    // Kiểm tra nếu đang chạy trên thiết bị iOS (iPhone, iPad, iPod)
    const isIOS =
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    // Kiểm tra nếu là Safari
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isIOS && isSafari && videoData.url.mp4) {
      // iOS Safari fallback - dùng file .mp4
      video.src = videoData.url.mp4;
      video.addEventListener("loadedmetadata", () => {
        video.play().catch(console.warn);
      });
    } else if (Hls.isSupported()) {
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
      hls.loadSource(videoData.url.m3u8);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play();
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      // fallback cho Safari
      video.src = videoData.url.m3u8;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
    }

    textureRef.current = new THREE.VideoTexture(video);
  }, []);

  useXRHitTest((hitTestResults, getHitPoseMatrix) => {
    if (!meshRef.current) return;

    const hit = hitTestResults[0];
    const mesh = meshRef.current;

    if (hit && mesh) {
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

        // Áp dụng xoay của người dùng
        mesh.rotation.x += userRotation.current.x;
        mesh.rotation.y += userRotation.current.y;
      } else {
        mesh.visible = false;
      }
    } else if (mesh) {
      mesh.visible = false;
    }
  }, "viewer");

  useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      const deltaX = e.touches[0].clientX - startX;
      const deltaY = e.touches[0].clientY - startY;

      const rotationSpeed = 0.005;
      userRotation.current.y += deltaX * rotationSpeed;
      userRotation.current.x += deltaY * rotationSpeed;

      // Giới hạn X để không lật ngược
      const maxX = Math.PI / 3;
      const minX = -Math.PI / 3;
      userRotation.current.x = Math.max(
        minX,
        Math.min(maxX, userRotation.current.x)
      );

      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[0.13, 0.09]} />
      <meshBasicMaterial
        map={textureRef.current ?? undefined}
        toneMapped={false}
      />
    </mesh>
  );
}
