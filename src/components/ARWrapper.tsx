import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useMemo, useEffect, useState } from "react";
import ARScene from "./ARScene";
import { useParams } from "react-router-dom";
import { Alert, Button, Spin } from "antd";

export default function ARWrapper() {
  const store = useMemo(() => createXRStore(), []);
  const { id } = useParams();
  const [isARSupported, setIsARSupported] = useState<boolean | null>(null);

  useEffect(() => {
    if (navigator.xr && navigator.xr.isSessionSupported) {
      navigator.xr
        .isSessionSupported("immersive-ar")
        .then((supported) => setIsARSupported(supported))
        .catch((err) => {
          console.error(err);
          setIsARSupported(false);
        });
    } else {
      setIsARSupported(false);
    }
  }, []);

  return (
    <>
      <div
        style={{
          position: "absolute",
          zIndex: 9999,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {isARSupported === null ? (
          <Spin size="large" tip="Đang kiểm tra hỗ trợ AR..." />
        ) : isARSupported ? (
          <Button type="primary" size="large" onClick={() => store.enterAR()}>
            Bắt đầu AR
          </Button>
        ) : (
          <Alert
            message="Thiết bị không hỗ trợ AR"
            description="Trình duyệt hoặc phần cứng của bạn không tương thích với chế độ thực tế tăng cường (AR)."
            type="error"
            showIcon
            style={{ maxWidth: 360 }}
          />
        )}
      </div>

      <Canvas
        style={{ width: "100vw", height: "100vh" }}
        gl={{ antialias: true, alpha: true }}
        camera={{ near: 0.01, far: 20, fov: 70 }}
      >
        <XR store={store}>
          <ambientLight />
          <ARScene videoId={Number(id)} />
        </XR>
      </Canvas>
    </>
  );
}
