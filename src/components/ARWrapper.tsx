import { Canvas } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useMemo } from "react";
import ARScene from "./ARScene";
import { useParams } from "react-router-dom";

export default function ARWrapper() {
  const store = useMemo(() => createXRStore(), []);
  const { id } = useParams();

  // useEffect(() => {
  //   const handleUserGesture = () => {
  //     store.enterXR("immersive-ar").catch((err) => {
  //       console.error(err);
  //     });
  //     window.removeEventListener("click", handleUserGesture);
  //   };

  //   window.addEventListener("click", handleUserGesture);

  //   return () => {
  //     window.removeEventListener("click", handleUserGesture);
  //   };
  // }, [store]);

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
        <button
          style={{
            padding: "16px 24px",
            fontSize: "18px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
          onClick={() => store.enterAR()}
        >
          Enter AR
        </button>
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
