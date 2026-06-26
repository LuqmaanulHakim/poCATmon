"use client";

import { useEffect } from "react";

export default function DisableZoom() {
  useEffect(() => {
    const preventDoubleTapZoom = (e: TouchEvent) => {
      if (e.touches.length > 1) return;
    };

    const preventCtrlZoom = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault();
    };

    document.addEventListener("wheel", preventCtrlZoom, { passive: false });

    document.addEventListener("touchstart", preventDoubleTapZoom, {
      passive: true,
    });

    return () => {
      document.removeEventListener("wheel", preventCtrlZoom);
      document.removeEventListener("touchstart", preventDoubleTapZoom);
    };
  }, []);

  return null;
}