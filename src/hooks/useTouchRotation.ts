import { useEffect, useRef } from "react";

export function useTouchRotation(limitX: number) {
  const rotation = useRef({ x: 0, y: 0 });

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
      const speed = 0.005;

      rotation.current.y += deltaX * speed;
      rotation.current.x = Math.max(
        -limitX,
        Math.min(limitX, rotation.current.x + deltaY * speed)
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
  }, [limitX]);

  return rotation;
}
