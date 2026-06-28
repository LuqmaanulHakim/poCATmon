"use client";

import { useEffect } from "react";

export default function DisableZoom() {
  useEffect(() => {
    const preventPinchZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    const preventCtrlZoom = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault();
    };

    document.addEventListener("touchstart", preventPinchZoom, { passive: false });
    document.addEventListener("touchmove", preventPinchZoom, { passive: false }); // belt-and-suspenders for sustained pinch
    document.addEventListener("wheel", preventCtrlZoom, { passive: false });

    return () => {
      document.removeEventListener("touchstart", preventPinchZoom);
      document.removeEventListener("touchmove", preventPinchZoom);
      document.removeEventListener("wheel", preventCtrlZoom);
    };
  }, []);

  return null;
}