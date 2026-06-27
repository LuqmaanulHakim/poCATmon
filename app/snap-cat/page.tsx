"use client";

import { useEffect, useRef, useState } from "react";

export default function SnapCatPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [streaming, setStreaming] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  // Start camera
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setStreaming(true);
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    }

    startCamera();

    // cleanup camera on leave
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  // Snap photo
  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = canvas.toDataURL("image/png");
    setPhoto(imageData);

    // Keep image for 5 seconds then clear
    setTimeout(() => {
      setPhoto(null);
    }, 5000);
  };

  const retake = () => {
    setPhoto(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4">
      <h1 className="text-xl font-bold mb-4">Snap Cat Camera 📸</h1>

      {/* Camera view */}
      {!photo && (
        <div className="relative">
          <video
            ref={videoRef}
            className="rounded-xl w-full max-w-md border border-gray-700"
            playsInline
            muted
          />

          {!streaming && (
            <p className="absolute top-2 left-2 text-sm text-gray-300">
              Starting camera...
            </p>
          )}
        </div>
      )}

      {/* Captured photo */}
      {photo && (
        <div className="flex flex-col items-center gap-3">
          <img
            src={photo}
            alt="Snap"
            className="rounded-xl w-full max-w-md border border-white"
          />
          <p className="text-sm text-gray-300">
            Auto clearing in 5 seconds...
          </p>

          <button
            onClick={retake}
            className="px-4 py-2 bg-white text-black rounded-lg"
          >
            Retake
          </button>
        </div>
      )}

      {/* Controls */}
      {!photo && (
        <button
          onClick={takePhoto}
          className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-full font-semibold"
        >
          Snap 📸
        </button>
      )}

      {/* hidden canvas */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}