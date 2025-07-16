import { useThree } from "@react-three/fiber";
import Hls from "hls.js";
import { useEffect, useRef, useState } from "react";
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

export default function FakeARScene({ videoId }: { videoId: number }) {
  const { scene } = useThree();
  const [cameraTexture, setCameraTexture] = useState<THREE.VideoTexture | null>(
    null
  );
  const meshRef = useRef<THREE.Mesh | null>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const userRotation = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const startPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const videoData = videoList.find((v) => v.id === videoId);
    if (!videoData) return;

    let video: HTMLVideoElement = document.createElement("video");
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
    } else {
      video.src = videoData.url.mp4;
      video.addEventListener("loadedmetadata", () => {
        video.play();
      });
    }

    textureRef.current = new THREE.VideoTexture(video);
  }, [videoId]);

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

        const camTexture = new THREE.VideoTexture(camVideo);
        setCameraTexture(camTexture);
      } catch (error) {
        console.error("Không thể truy cập camera:", error);
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

  // Xử lý vuốt/xoay
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      startPosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!meshRef.current) return;

      const deltaX = e.touches[0].clientX - startPosition.current.x;
      const deltaY = e.touches[0].clientY - startPosition.current.y;

      const rotationSpeed = 0.005;
      userRotation.current.y += deltaX * rotationSpeed;
      userRotation.current.x += deltaY * rotationSpeed;

      // Giới hạn X để không lật ngược
      const maxX = Math.PI / 4;
      const minX = -Math.PI / 4;
      userRotation.current.x = Math.max(
        minX,
        Math.min(maxX, userRotation.current.x)
      );

      // Áp dụng xoay
      meshRef.current.rotation.set(
        userRotation.current.x,
        userRotation.current.y,
        0
      );

      // Cập nhật vị trí bắt đầu
      startPosition.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);
  return (
    <mesh
      ref={meshRef}
      position={[0, 1.5, -2]}
      rotation={[userRotation.current.x, userRotation.current.y, 0]}
    >
      <planeGeometry args={[1.3, 0.9]} />
      <meshBasicMaterial
        map={textureRef.current ?? undefined}
        toneMapped={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}
