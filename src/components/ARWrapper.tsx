import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useMemo, useEffect, useState } from "react";
import ARScene from "./ARScene";
import { useParams } from "react-router-dom";
import { Alert, Button, Space, Spin } from "antd";
import FakeARScene from "./FakeARScene";

export default function ARWrapper() {
  const store = useMemo(() => createXRStore(), []);
  const { id } = useParams();
  const [isARSupported, setIsARSupported] = useState<boolean | null>(null);
  const [isFakeAR, setIsFakeAR] = useState<boolean>(false);

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
        ) : isFakeAR ? null : (
          <Space direction="vertical" align="center">
            <Alert
              message="Thiết bị không hỗ trợ AR"
              description="Trình duyệt hoặc phần cứng không hỗ trợ AR."
              type="warning"
              showIcon
              style={{ maxWidth: 360 }}
            />
            <Button onClick={() => setIsFakeAR(true)}>
              Bắt đầu chế độ giả lập AR
            </Button>
          </Space>
        )}
      </div>

      <Canvas
        style={{ width: "100vw", height: "100vh" }}
        gl={{ antialias: true, alpha: true }}
        camera={{ near: 0.01, far: 20, fov: 70 }}
      >
        {isARSupported && !isFakeAR ? (
          <XR store={store}>
            <ambientLight />
            <ARScene videoId={Number(id)} />
          </XR>
        ) : (
          <>
            <ambientLight />
            <FakeARScene videoId={Number(id)} />
          </>
        )}
      </Canvas>
    </>
  );
}
