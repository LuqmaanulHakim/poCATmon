"use client";

import { useState, useRef } from "react";
import { predictImage } from "../lib/teachable";

type Status = "idle" | "checking" | "processing" | "done" | "not-cat" | "error";

const STATUS_COPY: Record<Status, string> = {
  idle: "Upload a photo to start scanning",
  checking: "Scanning for wild cats...",
  processing: "Cutting out your cat...",
  done: "Cat caught!",
  "not-cat": "No cat detected in this photo",
  error: "Scan failed",
};

export default function Page() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorDetail, setErrorDetail] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Bumped on every new upload AND every reset. Any async callback
  // started under an earlier id is stale and must not touch state.
  const requestIdRef = useRef(0);
  // Tracks object URLs we've created so we can revoke them and avoid
  // a stale image flashing back in if something still holds a reference.
  const objectUrlsRef = useRef<string[]>([]);

  const revokeTrackedUrls = () => {
    const urls = objectUrlsRef.current;
    objectUrlsRef.current = [];
    // Defer revocation a tick so the old <img>/preview has already been
    // unmounted by React before its blob URL is invalidated. Revoking a
    // URL that's still attached to a live element can leave stale pixels
    // painted in some browsers instead of clearing immediately.
    if (urls.length > 0) {
      setTimeout(() => {
        urls.forEach((u) => URL.revokeObjectURL(u));
      }, 0);
    }
  };

  const reset = () => {
    setStatus("idle");
    setErrorDetail("");
    setResult(null);
    setConfidence(null);
    revokeTrackedUrls();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Invalidate any scan still in flight from before, then reset.
    const requestId = ++requestIdRef.current;
    reset();
    setStatus("checking");

    const url = URL.createObjectURL(file);
    objectUrlsRef.current.push(url);
    const img = new Image();

    img.onload = async () => {
      try {
        const pred = await predictImage(img);

        // A newer upload (or a reset) started after this one — bail out
        // so this stale callback can't overwrite the current state.
        if (requestIdRef.current !== requestId) return;

        const best = pred.reduce((a: any, b: any) =>
          a.probability > b.probability ? a : b
        );

        if (best.className !== "Cat") {
          setStatus("not-cat");
          return;
        }

        setConfidence(best.probability);
        setStatus("processing");

        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/remove-background", {
          method: "POST",
          body: formData,
        });

        if (requestIdRef.current !== requestId) return;

        if (!res.ok) {
          throw new Error("Background removal failed");
        }

        const blob = await res.blob();

        if (requestIdRef.current !== requestId) return;

        const outputUrl = URL.createObjectURL(blob);
        objectUrlsRef.current.push(outputUrl);

        setResult(outputUrl);
        setStatus("done");
      } catch (err: any) {
        if (requestIdRef.current !== requestId) return;
        setStatus("error");
        setErrorDetail(err.message || "Something went wrong");
      }
    };

    img.src = url;
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = "cat-sticker.png";
    a.click();
  };

  const handleScanAgain = () => {
    // Invalidate any in-flight scan before clearing state.
    requestIdRef.current += 1;
    reset();
    if (inputRef.current) inputRef.current.value = "";
  };

  const isScanning = status === "checking" || status === "processing";

  return (
    <div className="screen">
      <div className="backdrop" aria-hidden="true">
        <span className="paw paw-1">🐾</span>
        <span className="paw paw-2">🐾</span>
        <span className="paw paw-3">🐾</span>
        <span className="paw paw-4">🐾</span>
      </div>

      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">🐱</span>
          <span className="brand-text">CatGO</span>
        </div>
        <span className="eyebrow">Cat Sticker Scanner</span>
      </header>

      <main className="stage">
        {/* IDLE / CHECKING / PROCESSING — the scanner lens */}
        {status !== "done" && (
          <div className="lens-wrap">
            <div
              className={
                "lens" +
                (isScanning ? " lens-active" : "") +
                (status === "not-cat" ? " lens-miss" : "") +
                (status === "error" ? " lens-error" : "")
              }
            >
              <div className="ring ring-outer" />
              <div className="ring ring-mid" />
              <div className="lens-core">
                {status === "idle" && <span className="lens-icon">📷</span>}
                {isScanning && <span className="lens-icon spin">🐾</span>}
                {status === "not-cat" && <span className="lens-icon">🙅</span>}
                {status === "error" && <span className="lens-icon">⚠️</span>}
              </div>
            </div>

            <label className="upload-btn">
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={isScanning}
              />
              {status === "idle" ? "Choose a photo" : "Choose another photo"}
            </label>

            <p className={"status-line" + (status === "not-cat" || status === "error" ? " status-line-alert" : "")}>
              {STATUS_COPY[status]}
            </p>

            {status === "not-cat" && (
              <p className="hint">Try a clearer, closer photo of a cat — good lighting helps the scan.</p>
            )}

            {status === "error" && errorDetail && (
              <p className="hint hint-error">{errorDetail}</p>
            )}
          </div>
        )}

        {/* DONE — the catch card */}
        {status === "done" && result && (
          <div className="catch-card">
            <div className="catch-card-glow" />
            <div className="catch-card-badge">Caught!</div>
            <div className="catch-card-art">
              <div className="park-scene" aria-hidden="true">
                <div className="park-sky" />
                <div className="park-cloud park-cloud-1" />
                <div className="park-cloud park-cloud-2" />
                <div className="park-tree park-tree-1">
                  <div className="park-tree-canopy" />
                  <div className="park-tree-trunk" />
                </div>
                <div className="park-tree park-tree-2">
                  <div className="park-tree-canopy" />
                  <div className="park-tree-trunk" />
                </div>
                <div className="park-bush park-bush-1" />
                <div className="park-bush park-bush-2" />
                <div className="park-ground" />
              </div>
              <img key={result} src={result} alt="Your cat sticker" className="park-cat" />
            </div>
            <div className="catch-card-footer">
              <div className="catch-card-meta">
                <span className="catch-card-label">Wild Cat</span>
                {confidence !== null && (
                  <span className="catch-card-confidence">
                    {Math.round(confidence * 100)}% match
                  </span>
                )}
              </div>
              <div className="catch-card-actions">
                <button className="btn btn-primary" onClick={handleDownload}>
                  Download sticker
                </button>
                <button className="btn btn-ghost" onClick={handleScanAgain}>
                  Scan another
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        :global(body) {
          margin: 0;
        }

        .screen {
          position: relative;
          min-height: 100vh;
          background: radial-gradient(120% 120% at 50% -10%, #fff6ee 0%, #ffe8d4 55%, #ffd9b8 100%);
          font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          color: #2d2420;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .backdrop {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .paw {
          position: absolute;
          font-size: 2.5rem;
          opacity: 0.14;
          filter: blur(0.2px);
        }
        .paw-1 { top: 8%; left: 6%; transform: rotate(-18deg); font-size: 2rem; }
        .paw-2 { top: 18%; right: 10%; transform: rotate(22deg); font-size: 3.2rem; }
        .paw-3 { bottom: 14%; left: 12%; transform: rotate(8deg); font-size: 2.4rem; }
        .paw-4 { bottom: 22%; right: 8%; transform: rotate(-12deg); font-size: 1.8rem; }

        .topbar {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 28px 0;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .brand-mark {
          font-size: 1.6rem;
        }

        .brand-text {
          font-family: "Baloo 2", "Inter", sans-serif;
          font-weight: 700;
          font-size: 1.5rem;
          color: #d9622b;
          letter-spacing: 0.01em;
        }

        .eyebrow {
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #a9776a;
          background: #ffffffaa;
          border: 1px solid #ffd9b8;
          border-radius: 999px;
          padding: 6px 12px;
        }

        .stage {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px 20px 56px;
        }

        /* ---------- LENS (idle / scanning) ---------- */

        .lens-wrap {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
          max-width: 360px;
          width: 100%;
        }

        .lens {
          position: relative;
          width: 220px;
          height: 220px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ring {
          position: absolute;
          border-radius: 50%;
          border: 3px solid #ffb88c;
        }

        .ring-outer {
          inset: 0;
          border-color: #ffd9b8;
        }

        .ring-mid {
          inset: 18px;
          border-color: #ffb88c;
          border-style: dashed;
        }

        .lens-active .ring-outer {
          animation: pulse-ring 1.6s ease-out infinite;
        }

        .lens-active .ring-mid {
          animation: spin-slow 4s linear infinite;
        }

        .lens-miss .ring-outer,
        .lens-miss .ring-mid {
          border-color: #e9a99a;
        }

        .lens-error .ring-outer,
        .lens-error .ring-mid {
          border-color: #e08a6c;
        }

        .lens-core {
          position: relative;
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: linear-gradient(160deg, #ffffff 0%, #ffe9d6 100%);
          box-shadow: 0 8px 24px rgba(217, 98, 43, 0.18), inset 0 0 0 1px #ffe2cb;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .lens-icon {
          font-size: 3rem;
        }

        .lens-icon.spin {
          display: inline-block;
          animation: spin-slow 1.1s linear infinite;
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.96); opacity: 0.9; }
          70% { transform: scale(1.06); opacity: 0.35; }
          100% { transform: scale(0.96); opacity: 0.9; }
        }

        @keyframes spin-slow {
          to { transform: rotate(360deg); }
        }

        .upload-btn {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 13px 28px;
          border-radius: 999px;
          background: #ff8a5c;
          color: #fff8f2;
          font-weight: 700;
          font-size: 0.95rem;
          font-family: "Baloo 2", "Inter", sans-serif;
          letter-spacing: 0.01em;
          cursor: pointer;
          box-shadow: 0 6px 18px rgba(255, 138, 92, 0.4);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }

        .upload-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 22px rgba(255, 138, 92, 0.48);
        }

        .upload-btn input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .upload-btn input:disabled {
          cursor: not-allowed;
        }

        .status-line {
          font-family: "Baloo 2", "Inter", sans-serif;
          font-weight: 600;
          font-size: 1.05rem;
          color: #b6562b;
          text-align: center;
          min-height: 1.4em;
        }

        .status-line-alert {
          color: #c4402a;
        }

        .hint {
          font-size: 0.85rem;
          color: #8a6f63;
          text-align: center;
          max-width: 280px;
          margin: -8px 0 0;
        }

        .hint-error {
          color: #c4402a;
        }

        /* ---------- CATCH CARD (done) ---------- */

        .catch-card {
          position: relative;
          width: 100%;
          max-width: 320px;
          background: linear-gradient(165deg, #ffffff 0%, #fff3e9 100%);
          border-radius: 28px;
          padding: 22px;
          box-shadow: 0 18px 40px rgba(217, 98, 43, 0.22), inset 0 0 0 1px #ffe2cb;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .catch-card-glow {
          position: absolute;
          top: -40px;
          right: -40px;
          width: 140px;
          height: 140px;
          background: radial-gradient(circle, #ffd9b8 0%, transparent 70%);
          z-index: 0;
        }

        .catch-card-badge {
          align-self: flex-start;
          font-family: "Baloo 2", "Inter", sans-serif;
          font-weight: 700;
          font-size: 0.78rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #fff8f2;
          background: #ff8a5c;
          padding: 5px 14px;
          border-radius: 999px;
          z-index: 1;
        }

        .catch-card-art {
          position: relative;
          z-index: 1;
          border-radius: 18px;
          overflow: hidden;
          padding: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 220px;
        }

        .park-scene {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .park-sky {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, #ffe9d6 0%, #ffd9b8 70%, #f7c89a 100%);
        }

        .park-cloud {
          position: absolute;
          background: #fff8f2;
          border-radius: 999px;
          opacity: 0.85;
        }

        .park-cloud-1 {
          top: 14px;
          left: 18px;
          width: 46px;
          height: 16px;
        }

        .park-cloud-2 {
          top: 28px;
          right: 24px;
          width: 34px;
          height: 12px;
        }

        .park-ground {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 38%;
          background: #97c459;
          border-radius: 50% 50% 0 0 / 18px 18px 0 0;
        }

        .park-ground::before {
          content: "";
          position: absolute;
          inset: 0 0 auto 0;
          height: 10px;
          background: #a9d172;
          border-radius: 50% 50% 0 0 / 10px 10px 0 0;
        }

        .park-tree {
          position: absolute;
          bottom: 32%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .park-tree-1 {
          left: 14px;
        }

        .park-tree-2 {
          right: 18px;
        }

        .park-tree-2 .park-tree-canopy {
          width: 38px;
          height: 38px;
        }

        .park-tree-2 .park-tree-trunk {
          height: 16px;
        }

        .park-tree-canopy {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #639922;
        }

        .park-tree-trunk {
          width: 8px;
          height: 22px;
          background: #854f0b;
          border-radius: 0 0 3px 3px;
        }

        .park-bush {
          position: absolute;
          bottom: 32%;
          width: 26px;
          height: 18px;
          background: #79b13d;
          border-radius: 999px;
        }

        .park-bush-1 {
          left: 64px;
        }

        .park-bush-2 {
          right: 70px;
        }

        .park-cat {
          position: relative;
          z-index: 1;
          max-width: 100%;
          max-height: 200px;
          object-fit: contain;
          filter: drop-shadow(0 10px 18px rgba(45, 36, 32, 0.25));
        }

        .catch-card-footer {
          z-index: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .catch-card-meta {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
        }

        .catch-card-label {
          font-family: "Baloo 2", "Inter", sans-serif;
          font-weight: 700;
          font-size: 1.1rem;
          color: #2d2420;
        }

        .catch-card-confidence {
          font-size: 0.8rem;
          font-weight: 600;
          color: #b6562b;
        }

        .catch-card-actions {
          display: flex;
          gap: 10px;
        }

        .btn {
          flex: 1;
          padding: 11px 14px;
          border-radius: 999px;
          border: none;
          font-family: "Baloo 2", "Inter", sans-serif;
          font-weight: 700;
          font-size: 0.88rem;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease;
        }

        .btn-primary {
          background: #ff8a5c;
          color: #fff8f2;
          box-shadow: 0 6px 16px rgba(255, 138, 92, 0.4);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(255, 138, 92, 0.48);
        }

        .btn-ghost {
          background: #fff2e6;
          color: #b6562b;
          box-shadow: inset 0 0 0 1px #ffd9b8;
        }

        .btn-ghost:hover {
          background: #ffe9d6;
        }

        @media (prefers-reduced-motion: reduce) {
          .lens-active .ring-outer,
          .lens-active .ring-mid,
          .lens-icon.spin {
            animation: none;
          }
        }

        @media (max-width: 420px) {
          .lens {
            width: 180px;
            height: 180px;
          }
          .lens-core {
            width: 116px;
            height: 116px;
          }
          .topbar {
            padding: 18px 18px 0;
          }
        }
      `}</style>
    </div>
  );
}