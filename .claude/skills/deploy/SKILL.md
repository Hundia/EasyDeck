---
name: deploy
description: "Build the static export and deploy to hundia.casa. Use when the user says 'deploy', 'ship it', or '/deploy'. This presentation is PRIVATE — never publish to GitHub Pages."
argument-hint: "[--skip-tests to bypass test gate]"
---

# Deploy to hundia.casa

Builds the Next.js static export and deploys to the private domain.

## ⚠️ IMPORTANT: This is a PRIVATE presentation

- **NEVER** deploy to GitHub Pages
- **NEVER** push the `out/` folder to a public location
- The only authorized deployment target is: **https://hundia.casa/presentations/x_pres**
- A separate repo will be created later for the public deployment

## Pre-flight Checks

Run these in order. Stop and fix on any failure.

```bash
npm run type-check                  # TypeScript — must be clean
npm test                            # Vitest — all green
NEXT_OUTPUT=export npm run build    # Static export to out/
```

> Skip tests only if the user explicitly passes `--skip-tests`.

## Build Notes

- No `basePath` needed — the site is served at root of the domain
- Images must use relative paths or Next.js `<Image>` with `unoptimized: true`
- No `useSearchParams` without a `<Suspense>` boundary (breaks static export)
- Clean `.next/` if you see stale export errors: `rm -rf .next`

## Deploy

After build, push to master. Deployment to hundia.casa is handled externally.

```bash
git add <changed files>
git commit -m "feat: <description>"
git push origin master
```

## Live URL

**https://hundia.casa/presentations/x_pres**

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `rename … 500.html` error | `rm -rf .next` then rebuild |
| Asset 404 | Ensure no `basePath` is set in `next.config.ts` |
| `useSearchParams` without Suspense | Wrap component in `<Suspense>` |
| Framer Motion SSR error | Add `"use client"` to the component file |
