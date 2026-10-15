"use client";

import { useState } from "react";

interface GeneratedImage {
  prompt: string;
  url: string;
  timestamp: number;
}

const PROMPT_PRESETS = [
  "A futuristic city skyline at sunset, cyberpunk style",
  "A photorealistic portrait of an astronaut on Mars",
  "An oil painting of a serene mountain lake",
  "A cute robot reading a book in a cozy library",
  "Abstract geometric art with vibrant neon colors",
  "A medieval castle floating in the clouds",
];

const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:2", "2:3"];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [history, setHistory] = useState<GeneratedImage[]>([]);

  const generateImage = async () => {
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate image");
      }

      setCurrentImage(data.imageUrl);
      setHistory((prev) => [
        { prompt, url: data.imageUrl, timestamp: Date.now() },
        ...prev,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!currentImage) return;
    try {
      const res = await fetch(currentImage);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      window.open(currentImage, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            AI Image Generator
          </h1>
          <p className="mt-3 text-zinc-400">
            Free image generation &middot; no API key required
          </p>
        </header>

        {/* Prompt input */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the image you want to generate..."
              rows={3}
              className="flex-1 resize-none rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                  generateImage();
                }
              }}
            />
            <div className="flex flex-col gap-3 sm:w-56">
              <div className="grid grid-cols-3 gap-2">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`rounded-lg border px-2 py-2 text-xs transition ${
                      aspectRatio === ratio
                        ? "border-white bg-white text-zinc-950"
                        : "border-zinc-700 text-zinc-400 hover:border-zinc-500"
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
              <button
                onClick={generateImage}
                disabled={isLoading || !prompt.trim()}
                className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isLoading ? "Generating..." : "Generate"}
              </button>
            </div>
          </div>

          {/* Prompt presets */}
          <div className="flex flex-wrap gap-2">
            {PROMPT_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setPrompt(preset)}
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-200"
              >
                {preset.slice(0, 40)}
                {preset.length > 40 ? "..." : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Loading state */}
        {isLoading && (
          <div className="mb-6 flex aspect-square items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 sm:aspect-[2/1]">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
              <p className="text-sm text-zinc-400">Generating your image...</p>
              <p className="mt-1 text-xs text-zinc-600">
                Free tier can take up to a minute
              </p>
            </div>
          </div>
        )}

        {/* Current image */}
        {currentImage && !isLoading && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentImage} alt={prompt} className="w-full" />
            <div className="flex items-center justify-between gap-4 border-t border-zinc-800 px-4 py-3">
              <p className="max-w-[70%] truncate text-sm text-zinc-400">
                {prompt}
              </p>
              <button
                onClick={downloadImage}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              >
                Download
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!currentImage && !isLoading && (
          <div className="mb-8 flex aspect-square items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/50 sm:aspect-[2/1]">
            <div className="text-center">
              <p className="text-lg text-zinc-500">No images yet</p>
              <p className="mt-1 text-sm text-zinc-600">
                Enter a prompt and click Generate
              </p>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div>
            <h2 className="mb-4 text-lg font-semibold text-zinc-300">
              History ({history.length})
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {history.map((item) => (
                <button
                  key={item.timestamp}
                  onClick={() => setCurrentImage(item.url)}
                  className="group overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 text-left transition hover:border-zinc-600"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.url}
                    alt={item.prompt}
                    className="aspect-square w-full object-cover transition group-hover:opacity-80"
                  />
                  <div className="px-3 py-2">
                    <p className="truncate text-xs text-zinc-400">
                      {item.prompt}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <footer className="mt-12 border-t border-zinc-900 pt-6 text-center text-xs text-zinc-600">
          Images from the{" "}
          <a
            href="https://pollinations.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-zinc-400"
          >
            Pollinations
          </a>{" "}
          free API. One image at a time, roughly 45 seconds between generations.
        </footer>
      </div>
    </div>
  );
}
