---
name: deploy
description: "Build the static export and push to GitHub Pages. Use when the user says 'deploy', 'push to GitHub Pages', 'ship it', or '/deploy'."
argument-hint: "[--skip-tests to bypass test gate]"
---

# Deploy to GitHub Pages

Builds the Next.js static export and pushes `master` to trigger the GitHub Actions deploy workflow.

## Pre-flight Checks

Run these in order. Stop and fix on any failure.

```bash
npm run type-check                  # TypeScript — must be clean
npm test                            # Vitest — all green
NEXT_OUTPUT=export npm run build    # Static export to out/
```

> Skip tests only if the user explicitly passes `--skip-tests`.

## Build Notes

- `basePath: '/EasyDeck'` is applied automatically when `NEXT_OUTPUT=export`
- Images must use relative paths or Next.js `<Image>` with `unoptimized: true`
- No `useSearchParams` without a `<Suspense>` boundary (breaks static export)
- Clean `.next/` if you see stale export errors: `rm -rf .next`

## Push

```bash
git add <changed files>
git commit -m "feat: <description>"
git push origin master
```

The GitHub Actions workflow at `.github/workflows/deploy.yml` triggers on push to `master`:
1. `npm ci`
2. `NEXT_OUTPUT=export npm run build`
3. Upload `out/` → deploy to GitHub Pages

## Watch the Deploy

```
https://github.com/Hundia/EasyDeck/actions
```

Live URL after deploy: **https://hundia.github.io/EasyDeck/**

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `rename … 500.html` error | `rm -rf .next` then rebuild |
| Asset 404 on GitHub Pages | Check `basePath: '/EasyDeck'` in `next.config.ts` |
| `useSearchParams` without Suspense | Wrap component in `<Suspense>` |
| Framer Motion SSR error | Add `"use client"` to the component file |
