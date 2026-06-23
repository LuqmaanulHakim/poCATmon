"use client";

import { useState, useRef } from "react";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement | null>(null);

  async function detectCat(imageElement: HTMLImageElement) {
    const cocoSsd = await import("@tensorflow-models/coco-ssd");
    const tf = await import("@tensorflow/tfjs");

    await tf.ready();

    const model = await cocoSsd.load();

    const predictions = await model.detect(imageElement);

    console.log("Predictions:", predictions);

    // check if cat exists
    const hasCat = predictions.some(
      (p) =>
        p.class === "cat" &&
        p.score > 0.5
    );

    return hasCat;
  }

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);

    const url = URL.createObjectURL(file);
    setPreview(url);

    const img = new Image();
    img.src = url;

    img.onload = async () => {
      setLoading(true);

      try {
        // 1. CHECK IF CAT
        const isCat = await detectCat(img);

        if (!isCat) {
          setError("Only cat images are allowed 🐱");
          setLoading(false);
          return;
        }

        // 2. REMOVE BACKGROUND
        const { removeBackground } =
          await import(
            "@imgly/background-removal"
          );

        const blob = await removeBackground(
          file,
          { device: "cpu" }
        );

        const output =
          URL.createObjectURL(blob);

        setResult(output);
      } catch (err) {
        console.error(err);
        setError("Processing failed");
      } finally {
        setLoading(false);
      }
    };
  }

  return (
    <main className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Cat Background Remover 🐱
      </h1>

      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
      />

      {error && (
        <p className="text-red-500 mt-3">
          {error}
        </p>
      )}

      {loading && (
        <p className="mt-3">
          Checking cat + removing background...
        </p>
      )}

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="rounded-xl border"
          />
        )}

        {result && (
          <div>
            <img
              src={result}
              alt="result"
              className="rounded-xl border"
            />

            <a
              href={result}
              download="cat.png"
              className="inline-block mt-3 px-4 py-2 bg-black text-white rounded-lg"
            >
              Download PNG
            </a>
          </div>
        )}
      </div>
    </main>
  );
}