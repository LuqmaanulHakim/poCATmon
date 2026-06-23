"use client";

import { useState } from "react";

import { predictImage } from "../lib/teachable";
import { removeBackground } from "../lib/removeBackground";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);

    const url = URL.createObjectURL(file);

    const img = new Image();

    img.onload = async () => {
      try {
        // 🧠 STEP 1: Predict Cat or Not
        const pred = await predictImage(img);

        const best = pred.reduce(
          (a: any, b: any) =>
            a.probability > b.probability ? a : b
        );

        if (best.className !== "Cat") {
          setError("Only cat images are allowed 🐱");
          setLoading(false);
          return;
        }

        // ✂️ STEP 2: Remove background (FAST)
        const cutout = removeBackground(img);

        setResult(cutout);
      } catch (err) {
        console.log(err);
        setError("Failed to process image");
      }

      setLoading(false);
    };

    img.src = url;
  };

  return (
    <div
      style={{
        padding: 30,
        textAlign: "center",
        fontFamily: "Arial",
      }}
    >
      <h1>🐱 Cat Sticker Maker</h1>

      <input type="file" accept="image/*" onChange={handleUpload} />

      {/* LOADING */}
      {loading && (
        <div style={{ marginTop: 20 }}>
          <img src="/loading.gif" width={120} alt="loading" />
          <p>Processing image...</p>
        </div>
      )}

      {/* ERROR */}
      {error && (
        <p style={{ color: "red", marginTop: 10 }}>{error}</p>
      )}

      {/* RESULT */}
      {result && (
        <div style={{ marginTop: 20 }}>
          <h2>Your Sticker 🧷</h2>

          <img
            src={result}
            width={320}
            style={{
              borderRadius: 12,
              boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
            }}
            alt="sticker"
          />
        </div>
      )}
    </div>
  );
}