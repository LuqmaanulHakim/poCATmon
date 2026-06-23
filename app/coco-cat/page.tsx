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

    return predictions.some(
      (p) =>
        p.class === "cat" &&
        p.score > 0.5
    );
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

    // STEP 1: go loading immediately
    setStatus("loading");

    const url =
      URL.createObjectURL(file);

    const img = new window.Image();
    img.src = url;

    img.onload = async () => {
      try {
        // STEP 2: detect cat
        const isCat =
          await detectCat(img);

        if (!isCat) {
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

        setResult(output);

        // STEP 4: done
        setStatus("done");
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
        <div className="mt-6">
          <img
            src={result}
            className="rounded-xl border w-64"
          />

          <div className="flex gap-3 mt-4">
            {/* SAVE (not functional yet) */}
            <button
              onClick={resetToUpload}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Save
            </button>

            {/* CANCEL */}
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