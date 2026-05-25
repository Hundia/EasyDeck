# Claude Vision Handoff — Text-Image Alignment

## Your Task

You have vision capabilities. Analyze each image below and fix any text-image mismatches in the presentation code.

## Images Location

`/opt/dept_pres/public/presentations/x_pres/1.PNG` through `14.PNG`

Open each image, describe what you see, and compare it against the scene data in:
`/opt/dept_pres/src/app/presentations/x_pres/page.tsx`

## What to Fix

For each scene in the `scenes` array, verify:
- `titleEn` / `titleHe` — matches what the image shows
- `descriptionEn` / `descriptionHe` — accurately describes the visual
- `hudLabel` — appropriate for the scene
- `dataLine` — relevant technical readout
- `panelPosition` — doesn't cover the main visual interest area

## Expected Scene Order

| # | Image | Expected |
|---|-------|----------|
| 1 | 1.PNG | Hostile operative in desert at twilight |
| 2 | 2.PNG | Military command center, screens, alert |
| 3 | 3.PNG | Intel analyst workstation, research software |
| 4 | 4.PNG | Drone ground station + drones launching |
| 5 | 5.PNG | NSOC cyber attack, red alerts |
| 6 | 6.PNG | Cyber defense operator, playbook activation |
| 7 | 7.PNG | Drone surveillance feed, target tracking |
| 8 | 8.PNG | Commanding officer giving the order |
| 9 | 9.PNG | Drones surrounding target, surrender |
| 10 | 10.PNG | AI agent-to-agent investigation framework |
| 11 | 11.PNG | AI investigation dashboard with findings |
| 12 | 12.PNG | Spec-driven development infographic |
| 13 | 13.PNG | Thank you / closing slide |
| 14 | 14.PNG | Extra/transition (may be unused or title) |

## Rules

- If an image doesn't match its expected position, reorder the scenes array or reassign images
- Hebrew must be natural, not robotic translation
- Keep descriptions concise (they display on glass panels over images)
- `dataLine` should feel like real military/system readouts
- `panelPosition`: put it where it won't cover the image's focal point
  - If action is on left → use `"bottom-right"`
  - If action is on right → use `"bottom-left"`
  - If centered composition → use `"bottom-center"`

## After Fixing

```bash
cd /opt/dept_pres
npm run type-check
npm run build
systemctl restart easydeck-pres
git add -A
git commit -m "fix: VLM-aligned text to match actual images

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
GIT_SSH_COMMAND="ssh -i ~/.ssh/deploy_pres -o StrictHostKeyChecking=no" git push origin master
```

Live URL: https://hundia.casa/presentations/x_pres
