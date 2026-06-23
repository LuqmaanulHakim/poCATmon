"use client";

import { useState } from "react";
import Image from "next/image";

type Status = "idle" | "loading" | "done" | "error";

export default function Page() {
  const [status, setStatus] = useState<Status>("idle");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // =========================
  // CAT DETECTION (COCO-SSD)
  // =========================
  async function detectCat(imageElement: HTMLImageElement) {
    const cocoSsd = await import("@tensorflow-models/coco-ssd");
    const tf = await import("@tensorflow/tfjs");

    await tf.ready();

    const model = await cocoSsd.load();
    const predictions = await model.detect(imageElement);

    const cat = predictions.find(
      (p) => p.class === "cat" && p.score > 0.5
    );

    if (!cat) return null;

    return cat.bbox; // [x, y, width, height]
  }

  // =========================
  // STICKER CREATION
  // =========================
  function createSticker(img: HTMLImageElement): string {
  const padding = 60;
  const outlineSize = 10;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  canvas.width = img.width + padding * 2;
  canvas.height = img.height + padding * 2;

  const x = padding;
  const y = padding;

  // STEP 1: draw image offscreen to get pixel data
  const offCanvas = document.createElement("canvas");
  offCanvas.width = img.width;
  offCanvas.height = img.height;

  const offCtx = offCanvas.getContext("2d")!;
  offCtx.drawImage(img, 0, 0);

  const imgData = offCtx.getImageData(
    0,
    0,
    img.width,
    img.height
  );

  const data = imgData.data;

  // STEP 2: create white outline mask
  const outlineCanvas = document.createElement("canvas");
  outlineCanvas.width = img.width;
  outlineCanvas.height = img.height;

  const octx = outlineCanvas.getContext("2d")!;
  const outlineData = octx.createImageData(img.width, img.height);

  const out = outlineData.data;

  // simple dilation (expand alpha pixels)
  for (let y1 = 0; y1 < img.height; y1++) {
    for (let x1 = 0; x1 < img.width; x1++) {
      const i = (y1 * img.width + x1) * 4;

      const alpha = data[i + 3];

      if (alpha > 10) {
        // draw white pixel around it (outline effect)
        for (let dy = -outlineSize; dy <= outlineSize; dy++) {
          for (let dx = -outlineSize; dx <= outlineSize; dx++) {
            const nx = x1 + dx;
            const ny = y1 + dy;

            if (
              nx >= 0 &&
              ny >= 0 &&
              nx < img.width &&
              ny < img.height
            ) {
              const ni = (ny * img.width + nx) * 4;

              out[ni] = 255;
              out[ni + 1] = 255;
              out[ni + 2] = 255;
              out[ni + 3] = 255;
            }
          }
        }
      }
    }
  }

  octx.putImageData(outlineData, 0, 0);

  // STEP 3: draw white outline
  ctx.drawImage(outlineCanvas, x, y);

  // STEP 4: draw original image on top
  ctx.drawImage(img, x, y);

  return canvas.toDataURL("image/png");
}

  // rounded rectangle helper
  function roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // =========================
  // RESET
  // =========================
  function resetToUpload() {
    setStatus("idle");
    setResult(null);
    setError(null);
  }

  // =========================
  // UPLOAD + PROCESS FLOW
  // =========================
  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);
    setStatus("loading");

    const url = URL.createObjectURL(file);

    const img = new window.Image();
    img.src = url;

    img.onload = async () => {
      try {
        // STEP 1: detect cat
        const bbox = await detectCat(img);

        if (!bbox) {
          setStatus("error");
          setError("Only cat images are allowed 🐱");
          return;
        }

        // STEP 2: remove background
        const { removeBackground } = await import(
          "@imgly/background-removal"
        );

        const blob = await removeBackground(file, {
          device: "cpu",
        });

        const outputUrl = URL.createObjectURL(blob);

        const tempImg = new window.Image();
        tempImg.src = outputUrl;

        tempImg.onload = () => {
          // STEP 3: create sticker
          const sticker = createSticker(tempImg);

          setResult(sticker);
          setStatus("done");
        };
      } catch (err) {
        console.error(err);
        setStatus("error");
        setError("Processing failed");
      }
    };
  }

  // =========================
  // UI
  // =========================
  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Catch that CAT!
      </h1>

      {/* UPLOAD */}
      {status === "idle" && (
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="mb-5"
        />
      )}

      {/* LOADING */}
      {status === "loading" && (
        <div className="flex flex-col items-center gap-3 mt-10">
          <Image
            src="/loading.gif"
            alt="Loading"
            width={120}
            height={120}
            unoptimized
          />
          <p>Processing image...</p>
        </div>
      )}

      {/* ERROR */}
      {status === "error" && error && (
        <div className="mt-5 flex flex-col items-center gap-4">
          <p className="text-red-500 text-center">
            {error}
          </p>

          <button
            onClick={resetToUpload}
            className="px-5 py-2 bg-black text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      )}

      {/* RESULT */}
      {status === "done" && result && (
        <div className="mt-6 flex flex-col items-center">
          <img
            src={result}
            className="w-64"
            alt="sticker result"
          />

          <div className="flex gap-3 mt-4">
            <a
              href={result}
              download="cat-sticker.png"
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Download
            </a>

            <button
              onClick={resetToUpload}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}