import { Canvas, useThree } from "@react-three/fiber";
import { XR, createXRStore } from "@react-three/xr";
import { useEffect, useMemo } from "react";
import ARScene from "./ARScene";
import { ARButton } from "three/examples/jsm/Addons.js";

function AddARButton() {
  const { gl } = useThree();
  useEffect(() => {
    const arButton = ARButton.createButton(gl, {
      requiredFeatures: ["hit-test"],
      optionalFeatures: ["dom-overlay"],
      domOverlay: { root: document.body },
    });
    document.body.appendChild(arButton);

    // Cleanup
    return () => {
      if (arButton.parentElement) arButton.parentElement.removeChild(arButton);
    };
  }, [gl]);

  return null;
}

export default function ARWrapper() {
  const store = useMemo(() => createXRStore(), []);

  return (
    <>
      <Canvas
        style={{ width: "100vw", height: "100vh" }}
        gl={{ antialias: true, alpha: true }}
        camera={{ near: 0.01, far: 20, fov: 70 }}
      >
        <XR store={store}>
          <AddARButton />
          <ambientLight />
          <ARScene />
        </XR>
      </Canvas>
    </>
  );
}
