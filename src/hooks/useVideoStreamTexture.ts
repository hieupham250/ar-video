import { useEffect, useRef } from "react";
import * as THREE from "three";
import { videoList } from "../constants/videos";
import Hls from "hls.js";

export function useVideoStreamTexture(videoId: number) {
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  useEffect(() => {
    const videoData = videoList.find((v) => v.id === videoId);
    if (!videoData) return;

    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.setAttribute("webkit-playsinline", "true");
    videoRef.current = video;

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
      // hls.on(Hls.Events.MANIFEST_PARSED, () => {
      //   video.play();
      // });

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video
          .play()
          .then(() => {
            console.log("HLS video is playing");
          })
          .catch((e) => {
            console.error("Video play failed (HLS):", e);
          });
      });

      hlsRef.current = hls;
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = videoData.url.m3u8;
      // video.addEventListener("loadedmetadata", () => video.play());

      video.addEventListener("loadedmetadata", () => {
        video
          .play()
          .then(() => {
            console.log("Video is playing");
          })
          .catch((e) => {
            console.error("Video play failed:", e);
          });
      });
    } else {
      video.src = videoData.url.mp4;
      // video.addEventListener("loadedmetadata", () => video.play());

      video.addEventListener("loadedmetadata", () => {
        video
          .play()
          .then(() => {
            console.log("Video is playing");
          })
          .catch((e) => {
            console.error("Video play failed:", e);
          });
      });
    }

    const texture = new THREE.VideoTexture(video);
    textureRef.current = texture;

    return () => {
      if (textureRef.current) {
        textureRef.current.dispose();
        textureRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current.load();
        videoRef.current = null;
      }

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [videoId]);

  return textureRef;
}
