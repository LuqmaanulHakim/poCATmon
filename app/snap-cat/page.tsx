"use client";

import { useEffect, useRef, useState } from "react";
import { predictImage } from "../lib/teachable";

type CheckStatus = "idle" | "checking" | "cat" | "not-cat" | "error";

export default function SnapCatPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [streaming, setStreaming] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [checkStatus, setCheckStatus] = useState<CheckStatus>("idle");
  const [confidence, setConfidence] = useState<number | null>(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        const video = videoRef.current;
        video.srcObject = stream;
        // Wait for the browser to load the new source before playing,
        // otherwise play() races with the load and throws an AbortError.
        await new Promise<void>((resolve) => {
          video.onloadedmetadata = () => resolve();
        });
        await video.play();
        setStreaming(true);
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreaming(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

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
    setCheckStatus("idle");
    setConfidence(null);

    // Pause camera while photo is shown
    stopCamera();
  };

  const checkPhoto = async () => {
    if (!photo) return;

    setCheckStatus("checking");
    setConfidence(null);

    try {
      const img = new Image();
      img.src = photo;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Image load failed"));
      });

      const predictions = await predictImage(img);
      const best = predictions.reduce((a: any, b: any) =>
        a.probability > b.probability ? a : b
      );

      if (best.className === "Cat") {
        setConfidence(best.probability);
        setCheckStatus("cat");
      } else {
        setCheckStatus("not-cat");
      }
    } catch (err) {
      console.error("Prediction error:", err);
      setCheckStatus("error");
    }
  };

  const retake = () => {
    setPhoto(null);
    setCheckStatus("idle");
    setConfidence(null);
    startCamera();
  };

  const statusLabel: Record<CheckStatus, string> = {
    idle: "Tap Check for cat to scan",
    checking: "Scanning...",
    cat: "🐱 Cat detected!",
    "not-cat": "🙅 No cat found",
    error: "⚠️ Scan failed",
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 gap-4">
      <h1 className="text-xl font-bold">Snap Cat Camera 📸</h1>

      {/* Camera view */}
      {!photo && (
        <div className="relative w-full max-w-md">
          <video
            ref={videoRef}
            className="rounded-xl w-full border border-gray-700"
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
        <div className="flex flex-col items-center gap-3 w-full max-w-md">
          <img
            src={photo}
            alt="Snap"
            className="rounded-xl w-full border border-white"
          />

          {/* Status badge */}
          <p
            className={`text-sm font-semibold px-4 py-1 rounded-full ${
              checkStatus === "cat"
                ? "bg-green-600 text-white"
                : checkStatus === "not-cat"
                ? "bg-yellow-600 text-white"
                : checkStatus === "error"
                ? "bg-red-600 text-white"
                : checkStatus === "checking"
                ? "bg-blue-600 text-white animate-pulse"
                : "bg-gray-700 text-gray-300"
            }`}
          >
            {statusLabel[checkStatus]}
          </p>

          {checkStatus === "cat" && confidence !== null && (
            <p className="text-xs text-gray-400">
              {Math.round(confidence * 100)}% confidence
            </p>
          )}

          <div className="flex gap-3 w-full">
            <button
              onClick={checkPhoto}
              disabled={checkStatus === "checking"}
              className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-semibold transition-colors"
            >
              {checkStatus === "checking" ? "Scanning..." : "Check for cat 🐾"}
            </button>

            <button
              onClick={retake}
              className="flex-1 px-4 py-2 bg-white text-black hover:bg-gray-200 rounded-full font-semibold transition-colors"
            >
              Retake
            </button>
          </div>
        </div>
      )}

      {/* Snap button */}
      {!photo && (
        <button
          onClick={takePhoto}
          disabled={!streaming}
          className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-semibold transition-colors"
        >
          Snap 📸
        </button>
      )}

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}