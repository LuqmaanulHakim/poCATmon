"use client";

import { useState } from "react";
import Image from "next/image";

type Status = "idle" | "loading" | "done" | "error";

export default function Page() {
  const [status, setStatus] =
    useState<Status>("idle");

  const [result, setResult] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  async function detectCat(
    imageElement: HTMLImageElement
  ) {
    const cocoSsd = await import(
      "@tensorflow-models/coco-ssd"
    );

    const tf = await import(
      "@tensorflow/tfjs"
    );

    await tf.ready();

    const model =
      await cocoSsd.load();

    const predictions =
      await model.detect(imageElement);

    const cat = predictions.find(
      (p) =>
        p.class === "cat" &&
        p.score > 0.5
    );

    if (!cat) return null;

    return cat.bbox; // [x, y, width, height]
  }

  function cropToSubject(
    img: HTMLImageElement,
    bbox: number[]
  ): string {
    const [x, y, w, h] = bbox;

    const canvas =
      document.createElement("canvas");

    const ctx =
      canvas.getContext("2d")!;

    const padding = 30; // sticker space

    canvas.width = w + padding * 2;
    canvas.height = h + padding * 2;

    ctx.drawImage(
      img,
      x - padding,
      y - padding,
      w + padding * 2,
      h + padding * 2,
      0,
      0,
      canvas.width,
      canvas.height
    );

    return canvas.toDataURL("image/png");
  }

  function resetToUpload() {
    setStatus("idle");
    setResult(null);
    setError(null);
  }

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setError(null);
    setResult(null);

    // STEP 1: loading
    setStatus("loading");

    const url =
      URL.createObjectURL(file);

    const img = new window.Image();
    img.src = url;

    img.onload = async () => {
      try {
        // STEP 2: detect cat + bbox
        const bbox =
          await detectCat(img);

        if (!bbox) {
          setStatus("error");
          setError(
            "Only cat images are allowed 🐱"
          );
          return;
        }

        // STEP 3: remove background
        const {
          removeBackground,
        } = await import(
          "@imgly/background-removal"
        );

        const blob =
          await removeBackground(
            file,
            {
              device: "cpu",
            }
          );

        const output =
          URL.createObjectURL(blob);

        // convert to image for cropping
        const tempImg = new window.Image();
        tempImg.src = output;

        tempImg.onload = () => {
          // STEP 4: crop + center subject
          const cropped =
            cropToSubject(
              tempImg,
              bbox
            );

          setResult(cropped);
          setStatus("done");
        };
      } catch (err) {
        console.error(err);

        setStatus("error");
        setError("Processing failed");
      }
    };
  }

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Catch that CAT!
      </h1>

      {/* STEP 1: UPLOAD ONLY */}
      {status === "idle" && (
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="mb-5"
        />
      )}

      {/* STEP 2: LOADING ONLY */}
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

      {/* STEP 3: ERROR ONLY */}
      {status === "error" && error && (
        <div className="mt-5 flex flex-col items-center gap-4">
          <p className="text-red-500 text-center">
            {error}
          </p>

          <button
            onClick={resetToUpload}
            className="px-5 py-2 bg-black text-white rounded-lg"
          >
            OK
          </button>
        </div>
      )}

      {/* STEP 4: RESULT ONLY */}
      {status === "done" && result && (
        <div className="mt-6 flex flex-col items-center">
          <img
            src={result}
            className="rounded-xl border w-64"
          />

          <div className="flex gap-3 mt-4">
            <button
              onClick={resetToUpload}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Save
            </button>

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