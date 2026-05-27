---
name: deploy
description: "Build the static export and deploy to hundia.casa. Use when the user says 'deploy', 'ship it', or '/deploy'. This presentation is PRIVATE — never publish to GitHub Pages."
argument-hint: "[--skip-tests to bypass test gate]"
---

# Deploy to hundia.casa

Builds the Next.js production build and restarts the local Next.js server on port 3848, which nginx reverse-proxies to `https://hundia.casa/presentations/x_pres`.

## ⚠️ IMPORTANT: This is a PRIVATE presentation

- **NEVER** deploy to GitHub Pages
- **NEVER** push the `out/` folder to a public location
- The only authorized deployment target is: **https://hundia.casa/presentations/x_pres**

## Architecture

```
nginx (hundia.casa:443)
  └─ location /presentations/x_pres → proxy_pass http://127.0.0.1:3848
  └─ location /presentations/x_pres/frames/ → alias /opt/dept_pres/public/presentations/x_pres/frames/

Next.js production server (port 3848)
  └─ /opt/dept_pres
```

## Deploy Steps

### 1. Pre-flight (optional, skip with --skip-tests)

```bash
npm run type-check
npm test
```

### 2. Build

```bash
cd /opt/dept_pres
npm run build
```

### 3. Restart the server

Find and kill the existing Next.js server, then start fresh:

```bash
# Find PID
ss -tlnp | grep 3848
# Kill it (use the actual PID from above)
kill <PID>
# Start new server (detached)
cd /opt/dept_pres && npx next start -p 3848 &>/dev/null & disown
```

### 4. Verify

```bash
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3848/presentations/x_pres
# Should return 200
```

### 5. Push to git (optional, for version tracking)

```bash
git add -A
git commit -m "feat: <description>"
git push origin master
```

## Live URL

**https://hundia.casa/presentations/x_pres**

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| 502 Bad Gateway | Server not running — restart with `npx next start -p 3848` |
| Stale content | Rebuild + restart server |
| Port already in use | Kill existing process: `ss -tlnp \| grep 3848` then `kill <PID>` |
| Asset 404 | Static files served by nginx from `/opt/dept_pres/public/` |
| `rm -rf .next` | Clean build cache if you see stale export errors |
