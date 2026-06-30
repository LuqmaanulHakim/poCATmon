"use client";

import { useEffect, useRef, useState } from "react";
import { predictImage } from "../lib/teachable";

type AppState = "live" | "snapped" | "scanning" | "result-cat" | "result-notcat" | "error" | "no-camera";

// ─── Corner brackets ──────────────────────────────────────────────────────────
function CornerBrackets() {
  const S = 28, O = 14, W = 2;
  const pts = [
    `${O+S},${O} ${O},${O} ${O},${O+S}`,
    `${100-O-S},${O} ${100-O},${O} ${100-O},${O+S}`,
    `${O},${100-O-S} ${O},${100-O} ${O+S},${100-O}`,
    `${100-O},${100-O-S} ${100-O},${100-O} ${100-O-S},${100-O}`,
  ];
  return (
    <svg
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"
    >
      {pts.map((p, i) => (
        <polyline
          key={i} points={p} fill="none"
          stroke="var(--accent)" strokeWidth={W}
          strokeLinecap="square" vectorEffect="non-scaling-stroke"
        />
      ))}
    </svg>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
type BadgeVariant = "cat" | "notcat" | "scanning" | "error";

const BADGE_CONFIGS: Record<BadgeVariant, { bg: string; color: string; border: string; label: string }> = {
  cat:      { bg: "rgba(34,197,94,0.15)",   color: "#166534", border: "rgba(34,197,94,0.35)",    label: "Cat verified" },
  notcat:   { bg: "rgba(234,179,8,0.15)",   color: "#854d0e", border: "rgba(234,179,8,0.35)",    label: "No cat found" },
  scanning: { bg: "color-mix(in srgb, var(--accent) 12%, transparent)",
              color: "var(--accent)",        border: "color-mix(in srgb, var(--accent) 35%, transparent)", label: "Scanning…"    },
  error:    { bg: "rgba(239,68,68,0.12)",   color: "#b91c1c", border: "rgba(239,68,68,0.35)",    label: "Scan failed"  },
};

function Badge({ variant }: { variant: BadgeVariant }) {
  const { bg, color, border, label } = BADGE_CONFIGS[variant];
  return (
    <div style={{
      position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)",
      display: "flex", alignItems: "center", gap: 5, padding: "4px 12px",
      borderRadius: 3, background: bg, color, fontSize: 11, fontWeight: 600,
      letterSpacing: "0.06em", whiteSpace: "nowrap", zIndex: 20,
      border: `1px solid ${border}`,
      animation: variant === "scanning" ? "pocatmon-pulse 1s ease-in-out infinite" : "none",
    }}>
      {label}
    </div>
  );
}

// ─── Shutter button ───────────────────────────────────────────────────────────
function ShutterButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick} disabled={disabled} aria-label="Take photo"
      style={{
        width: 64, height: 64, borderRadius: "50%",
        border: "2.5px solid var(--accent)",
        background: "transparent", display: "flex", alignItems: "center",
        justifyContent: "center", cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.3 : 1, transition: "transform 0.12s, opacity 0.2s", flexShrink: 0,
      }}
      onMouseDown={e => { if (!disabled) (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.93)"; }}
      onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
    >
      <div style={{ width: 46, height: 46, borderRadius: "50%", background: "var(--accent)" }} />
    </button>
  );
}

// ─── Ghost button ─────────────────────────────────────────────────────────────
function GhostButton({ label, onClick, visible = true }: { label: string; onClick: () => void; visible?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent", border: "1px solid var(--card-border)", borderRadius: 3,
        color: "var(--muted)", fontSize: 13, fontWeight: 500, padding: "10px 18px",
        cursor: "pointer", letterSpacing: "0.02em",
        visibility: visible ? "visible" : "hidden",
        transition: "border-color 0.15s, color 0.15s", whiteSpace: "nowrap",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
        (e.currentTarget as HTMLElement).style.color = "var(--foreground)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = "var(--card-border)";
        (e.currentTarget as HTMLElement).style.color = "var(--muted)";
      }}
    >
      {label}
    </button>
  );
}

// ─── Primary button ───────────────────────────────────────────────────────────
function PrimaryButton({ label, onClick, disabled }: { label: string; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick} disabled={disabled}
      style={{
        width: "100%", maxWidth: 340,
        background: "var(--accent)", border: "none", borderRadius: 3,
        color: "#fff", fontSize: 13, fontWeight: 600, padding: "13px 0",
        cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.4 : 1,
        letterSpacing: "0.04em", transition: "filter 0.15s, opacity 0.2s",
      }}
      onMouseEnter={e => { if (!disabled) (e.currentTarget as HTMLElement).style.filter = "brightness(0.88)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = "none"; }}
    >
      {label}
    </button>
  );
}

// ─── Mode label (replaces the nav mode slot) ──────────────────────────────────
// Rendered inside the page body so Toolbar can stay pure layout.
function ModeLabel({ label }: { label: string }) {
  return (
    <div style={{
      width: "100%", maxWidth: 340,
      display: "flex", alignItems: "center", justifyContent: "flex-end",
    }}>
      <span style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.1em", fontWeight: 500 }}>
        {label}
      </span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function SnapCatPage() {
  const videoRef  = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [appState,   setAppState]   = useState<AppState>("live");
  const [photo,      setPhoto]      = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [imageSize,  setImageSize]  = useState<string | null>(null);
  const [streaming,  setStreaming]  = useState(false);
  const [ zoom, setZoom ] = useState(1);

  // ── Camera helpers ──────────────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      // stop previous stream first
      stopCamera();

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: {
              ideal: "environment",
            },

            // reduce memory usage
            width: {
              ideal: 1280,
              max: 1920,
            },

            height: {
              ideal: 1280,
              max: 1920,
            },

            frameRate: {
              ideal: 30,
              max: 30,
            },
          },

          audio: false,
        });

      streamRef.current = stream;

      const video = videoRef.current;

      if (!video) return;

      video.srcObject = stream;

      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          resolve();
        };
      });

      await video.play();

      setStreaming(true);

      // restore previous zoom
      if (zoom > 1) {
        try {
          await applyZoom(zoom);
        } catch {
          // ignore unsupported zoom
        }
      }

    } catch (error) {
      console.error(error);

      setStreaming(false);

      setAppState("no-camera");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setStreaming(false);
  };

  const applyZoom = async (value: number) => {
    try {
      const track = streamRef.current?.getVideoTracks()[0];

      if (!track) return;

      const capabilities =
        track.getCapabilities?.() as MediaTrackCapabilities & {
          zoom?: {
            min: number;
            max: number;
          };
        };

      if (!capabilities?.zoom) return;

      await track.applyConstraints({
        advanced: [
          {
            zoom: Math.min(
              Math.max(value, capabilities.zoom.min),
              capabilities.zoom.max
            ),
          },
        ],
      } as any);

      setZoom(value);
    } catch {
      console.log("Zoom unsupported");
    }
  };

  useEffect(() => { startCamera(); return stopCamera; }, []);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // limit exported size
    const MAX = 1080;

    const ratio =
      Math.min(
        MAX / video.videoWidth,
        MAX / video.videoHeight,
        1
      );

    canvas.width = Math.floor(video.videoWidth * ratio);
    canvas.height = Math.floor(video.videoHeight * ratio);

    ctx.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height
    );

    // smaller file
    const dataUrl =
      canvas.toDataURL(
        "image/jpeg",
        0.75
      );

    const sizeKB =
      Math.round(
        (dataUrl.length * 0.75) / 1024
      );

    setPhoto(dataUrl);

    setImageSize(
      sizeKB >= 1024
        ? `${(sizeKB / 1024).toFixed(2)} MB`
        : `${sizeKB} KB`
    );

    setConfidence(null);

    setAppState("snapped");

    stopCamera();
  };

  const checkPhoto = async () => {
    if (!photo) return;
    setAppState("scanning");
    setConfidence(null);
    try {
      const img = new Image();
      img.src = photo;
      await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(); });
      const predictions = await predictImage(img);
      const best = predictions.reduce((a: any, b: any) => a.probability > b.probability ? a : b);
      if (best.className === "Cat") { setConfidence(best.probability); setAppState("result-cat"); }
      else setAppState("result-notcat");
    } catch {
      setAppState("error");
    }
  };

  const retake = () => {
    setPhoto(null); setConfidence(null); setImageSize(null);
    setAppState("live"); startCamera();
  };

  // ── Derived state ────────────────────────────────────────────────────────────
  const isLive     = appState === "live";
  const isCat      = appState === "result-cat";
  const isNotCat   = appState === "result-notcat";
  const isScanning = appState === "scanning";
  const isError    = appState === "error";

  const badgeVariant = isScanning ? "scanning" : isCat ? "cat" : isNotCat ? "notcat" : isError ? "error" : null;
  const checkLabel   = isScanning ? "Scanning…" : isCat ? "Pin to map →" : isError ? "Try again" : "Check for cat";
  const hint = isLive         ? "tap to snap"
    : appState === "snapped"  ? "looks good? run the scan"
    : isScanning              ? "AI is reviewing your photo"
    : isCat                   ? "cat confirmed — add it to the map"
    : isNotCat                ? "no cat detected — try another shot"
    : isError                 ? "something went wrong" : "";
  const modeLabel = isLive ? "CAMERA" : isScanning ? "SCANNING" : isCat ? "VERIFIED"
    : isNotCat ? "NO CAT" : isError ? "ERROR" : "REVIEW";

  return (
    <>
      <style>{`
        @keyframes pocatmon-pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{
        minHeight: "100svh",
        background: "var(--background)",
        display: "flex", flexDirection: "column",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        color: "var(--foreground)",
        // top padding accounts for the Toolbar rendered in layout.tsx
        padding: "80px 16px 32px",
        gap: 18,
      }}>

        {/* Mode label row */}
        <ModeLabel label={modeLabel} />

        {/* ── Viewfinder ── */}
        <div style={{
          position: "relative", width: "100%", maxWidth: 360, aspectRatio: "1 / 1",
          background: "color-mix(in srgb, var(--background) 60%, var(--foreground) 4%)",
          borderRadius: 4,
          border: "1px solid var(--card-border)",
          overflow: "hidden", flexShrink: 0,
        }}>
          <video ref={videoRef} playsInline muted style={{
            position: "absolute", inset: 0, width: "100%", height: "100%",
            objectFit: "cover", display: isLive ? "block" : "none",
          }} />

          {photo && (
            <img src={photo} alt="Captured photo" style={{
              position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
            }} />
          )}

          {appState === "no-camera" && (
            <div style={{
              position: "absolute", inset: 0, display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 10,
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
                stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>Camera not available</span>
            </div>
          )}

          <CornerBrackets />
          
          {badgeVariant && <Badge variant={badgeVariant as BadgeVariant} />}

          {(isCat || isNotCat || appState === "snapped") && imageSize && (
            <div style={{
              position: "absolute", bottom: 12, left: 14, right: 14,
              display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 20,
            }}>
              {isCat && confidence !== null
                ? <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--accent)" }}>
                    {Math.round(confidence * 100)}% confidence
                  </span>
                : <span />}
              <span style={{ fontFamily: "monospace", fontSize: 11, color: "var(--muted)" }}>{imageSize}</span>
            </div>
          )}
        </div>

        {/* ── Controls row ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", maxWidth: 340, padding: "0 4px",
        }}>
          {/* Left slot — retake (only visible when not live) */}
          <div style={{ width: 80 }}>
            <GhostButton label="Retake" onClick={retake} visible={!isLive} />
          </div>

          {/* Centre — shutter */}
          <ShutterButton onClick={takePhoto} disabled={!isLive || !streaming} />

          {/* Right slot — zoom (only visible when live) */}
          <div style={{ width: 80, display: "flex", alignItems: "center", justifyContent: "flex-start", paddingLeft: 16 }}>
            {isLive && (
              <button
                onClick={() => applyZoom(zoom === 1 ? 2 : 1)}
                style={{
                  width: 46, height: 46,
                  borderRadius: "50%",
                  background: "rgba(0,0,0,0.45)",
                  border: "1px solid rgba(255,255,255,.18)",
                  color: "#fff",
                  fontSize: 14, fontWeight: 700,
                  cursor: "pointer",
                  backdropFilter: "blur(12px)",
                }}
              >
                {zoom}×
              </button>
            )}
          </div>
        </div>

        {/* ── Primary action ── */}
        {!isLive && (
          <PrimaryButton
            label={checkLabel}
            onClick={isCat ? () => alert("Pin to map!") : isError || isNotCat ? retake : checkPhoto}
            disabled={isScanning}
          />
        )}

        {/* ── Hint ── */}
        <span style={{ fontSize: 11, color: "var(--muted)", letterSpacing: "0.04em", textAlign: "center" }}>
          {hint}
        </span>

        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>
    </>
  );
}