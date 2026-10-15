# AI Image Generator

A portfolio project that generates images from text prompts using the free, no-signup [Pollinations](https://pollinations.ai) image API.

## Features

- Text-to-image generation, free with no API key
- Aspect ratio selector (1:1, 16:9, 9:16, 4:3, 3:2, 2:3)
- Prompt presets for quick starts
- Random seed per generation, so repeats of the same prompt differ
- Session history gallery, click to revisit images
- Download generated images
- Friendly handling of free-tier rate limits and timeouts

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables required.

## How it works

- `app/page.tsx` - client UI with prompt form, gallery, and download
- `app/api/generate/route.ts` - server route that calls
  `https://image.pollinations.ai/prompt/{prompt}` and returns the image as a
  base64 data URL

Proxying through the server route keeps the generation request off the
browser, maps aspect ratios to allowed sizes (max 768x768), attaches a random
seed, and converts service errors (rate limit, timeout) into clean JSON errors
the UI can display.

## Free tier limits

Pollinations allows one image at a time, roughly 45 seconds apart, per IP.
The UI surfaces this as a clear message. Best effort service: no uptime
guarantee.

## Deploy

Deploys to Vercel with no config and no secrets.
