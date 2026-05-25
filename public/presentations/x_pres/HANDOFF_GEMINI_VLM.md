# Gemini VLM Handoff — Text-Image Alignment Review

## Context

You are reviewing a cinematic scrollytelling presentation for the **Intelligence Software Department**. The presentation has 14 scenes, each with a background image and text overlays (English + Hebrew).

**The problem:** Some scene texts may not accurately describe what's shown in the corresponding image. Your job is to use your vision capabilities to analyze each image and fix any text-image mismatches.

## Files

- **Presentation source:** `/opt/dept_pres/src/app/presentations/x_pres/page.tsx`
- **Original brief:** `/opt/dept_pres/public/presentations/x_pres/presentation.md`
- **Design system:** `/opt/dept_pres/public/presentations/x_pres/design_system.md`
- **Images (PNG originals):** `/opt/dept_pres/public/presentations/x_pres/1.PNG` through `14.PNG`
- **Images (WebP for serving):** `/opt/dept_pres/public/presentations/x_pres/frames/frame-0001.webp` through `frame-0014.webp`

## Your Task

### Step 1: Analyze Each Image

For each image (1.PNG through 14.PNG), use your vision capabilities to describe:
1. What is actually depicted in the image
2. The mood, setting, and key visual elements
3. Any text or UI elements visible in the image

### Step 2: Compare with Scene Data

The scene data in `page.tsx` contains for each scene:
- `titleEn` / `titleHe` — the headline
- `descriptionEn` / `descriptionHe` — the explanation text
- `hudLabel` — the HUD overlay label
- `dataLine` — technical data readout

Compare what you SEE in each image versus what the text SAYS.

### Step 3: Fix Mismatches

For any scene where the text doesn't match the image, update the scene data in `page.tsx`:
- Keep the narrative flow coherent (it's a sequential story)
- Keep Hebrew translations accurate and natural (not Google Translate quality)
- Keep the HUD labels and data lines relevant to what's actually shown
- Maintain the military/intelligence tone

### Step 4: Rebuild & Verify

After making changes:
```bash
cd /opt/dept_pres
npm run build
systemctl restart easydeck-pres
```

Then verify: https://hundia.casa/presentations/x_pres

## Scene Mapping (Image → Expected Content)

| Image | Expected Scene |
|-------|---------------|
| 1.PNG | Approaching threat — hostile operative in desert terrain |
| 2.PNG | Command center alert — screens, officers, tactical displays |
| 3.PNG | Intel research software — analyst workstation, research trees |
| 4.PNG | Drone dispatch — ground station + drones taking off |
| 5.PNG | Cyber attack — NSOC, red alerts, breach detected |
| 6.PNG | Cyber defense — operator activating defensive playbook |
| 7.PNG | Target acquired — VISINT feed, drone surveillance |
| 8.PNG | Command decision — general giving the order |
| 9.PNG | Capture — drones surrounding target, surrender |
| 10.PNG | AI investigation — agent-to-agent AI framework |
| 11.PNG | Investigation results — AI dashboard, findings |
| 12.PNG | Spec-driven development — philosophy infographic |
| 13.PNG | Thank you — closing slide |
| 14.PNG | Additional/transition slide |

## Important Notes

- The presentation is bilingual (English + Hebrew). Hebrew must be RTL and natural.
- Keep descriptions concise — they appear on glassmorphism panels over images.
- The `dataLine` should feel like real military/system readouts.
- Don't change the CSS or animation logic — only the text content in the `scenes` array.
- If an image genuinely doesn't match ANY expected scene, consider reordering.

## Commit When Done

```bash
cd /opt/dept_pres
git add -A
git commit -m "fix: align presentation text with actual image content (VLM review)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
GIT_SSH_COMMAND="ssh -i ~/.ssh/deploy_pres -o StrictHostKeyChecking=no" git push origin master
```
