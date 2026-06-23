"use client";

import { useState } from "react";

export default function Page() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      // show original preview
      setPreview(URL.createObjectURL(file));

      // dynamic import
      const {
        removeBackground,
      } = await import(
        "@imgly/background-removal"
      );

      // remove bg
      const blob =
        await removeBackground(file, {
          device: "cpu",
        });

      const output =
        URL.createObjectURL(blob);

      setResult(output);
    } catch (error) {
      console.error(error);
      alert("Failed removing background");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">
        Cat Background Remover
      </h1>

      <label className="border rounded-xl px-5 py-3 inline-block cursor-pointer">
        Upload Image
        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
      </label>

      {loading && (
        <div className="mt-6">
          <p>🐱 Scanning cat...</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 mt-8">
        {preview && (
          <div>
            <h2 className="font-semibold mb-3">
              Original
            </h2>

            <img
              src={preview}
              alt="original"
              className="rounded-xl border"
            />
          </div>
        )}

        {result && (
          <div>
            <h2 className="font-semibold mb-3">
              Background Removed
            </h2>

            <div
              className="
              rounded-xl
              border
              p-4
              bg-[linear-gradient(45deg,#ddd_25%,transparent_25%,transparent_75%,#ddd_75%),linear-gradient(45deg,#ddd_25%,transparent_25%,transparent_75%,#ddd_75%)]
              bg-[length:20px_20px]
              bg-[position:0_0,10px_10px]
            "
            >
              <img
                src={result}
                alt="removed"
                className="max-h-[500px]"
              />
            </div>

            <a
              href={result}
              download="cat-no-bg.png"
              className="
                inline-block
                mt-4
                px-5
                py-2
                rounded-xl
                bg-black
                text-white
              "
            >
              Download PNG
            </a>
          </div>
        )}
      </div>
    </main>
  );
}