import { NextRequest, NextResponse } from "next/server";

// Pollinations free image API: no key, rate-limited per IP
// (one image at a time, ~45 seconds apart). Docs:
// https://raw.githubusercontent.com/pollinations/pollinations/master/APIDOCS.md
const POLLINATIONS_BASE = "https://image.pollinations.ai/prompt/";

// Max canvas is 768x768 total pixels; aspect ratio is preserved.
const SIZES: Record<string, { width: number; height: number }> = {
  "1:1": { width: 768, height: 768 },
  "16:9": { width: 768, height: 432 },
  "9:16": { width: 432, height: 768 },
  "4:3": { width: 768, height: 576 },
  "3:2": { width: 768, height: 512 },
  "2:3": { width: 512, height: 768 },
};

export async function POST(req: NextRequest) {
  try {
    const { prompt, aspectRatio } = await req.json();

    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const size = SIZES[aspectRatio] ?? SIZES["1:1"];
    const seed = Math.floor(Math.random() * 1_000_000);
    const url =
      `${POLLINATIONS_BASE}${encodeURIComponent(prompt.trim())}` +
      `?width=${size.width}&height=${size.height}&seed=${seed}&safe=false`;

    const res = await fetch(url, { signal: AbortSignal.timeout(120_000) });

    if (!res.ok) {
      if (res.status === 402) {
        return NextResponse.json(
          {
            error:
              "Free tier rate limit hit. Wait about 45 seconds before generating again.",
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `Image service error (${res.status})` },
        { status: 502 }
      );
    }

    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    if (!contentType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Image service returned an unexpected response" },
        { status: 502 }
      );
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const imageUrl = `data:${contentType};base64,${buffer.toString("base64")}`;

    return NextResponse.json({ imageUrl, seed });
  } catch (error) {
    console.error("Generation error:", error);
    const message =
      error instanceof Error && error.name === "TimeoutError"
        ? "Image service timed out. Try again."
        : "Failed to generate image";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
