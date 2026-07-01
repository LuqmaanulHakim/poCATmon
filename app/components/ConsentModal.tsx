"use client";

type ConsentModalProps = {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  imagePreview?: string | null;
};

export default function ConsentModal({ open, onConfirm, onCancel, imagePreview }: ConsentModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)",
        padding: 20,
      }}
      onClick={onCancel}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%", maxWidth: 340,
          background: "var(--background)",
          border: "1px solid var(--card-border)",
          borderRadius: 6,
          padding: 20,
          display: "flex", flexDirection: "column", gap: 14,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Photo to upload"
            style={{
              width: "100%", aspectRatio: "1 / 1", objectFit: "cover",
              borderRadius: 4, border: "1px solid var(--card-border)",
            }}
          />
        )}

        <div>
          <h2 id="consent-title" style={{
            fontSize: 14, fontWeight: 700, color: "var(--foreground)",
            margin: 0, marginBottom: 6, letterSpacing: "0.01em",
          }}>
            Upload this photo?
          </h2>
          <p style={{
            fontSize: 12.5, color: "var(--muted)", lineHeight: 1.5, margin: 0,
          }}>
            This photo and your current location will be saved and shown on the public map.
            Please confirm you're okay sharing it.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 3,
              border: "1px solid var(--card-border)", background: "transparent",
              color: "var(--foreground)", fontSize: 13, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            No
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 3,
              border: "none", background: "var(--accent)",
              color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Yes, upload
          </button>
        </div>
      </div>
    </div>
  );
}