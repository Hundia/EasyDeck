"use client";

import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { Observer } from "gsap/Observer";
import VideoBackground, { VideoBackgroundHandle } from "./VideoBackground";
import "./styles.css";

/* ─── Types ───────────────────────────────────────────────────────── */

type ScrollMode = "gsap" | "continuous" | "autoplay";
type Language = "both" | "en" | "he";
type PanelPosition = "bottom-left" | "bottom-right" | "bottom-center" | "top-left" | "top-right";
type MediaMode = "image" | "video";
type TransitionVersion = "A" | "B" | "C";

interface Scene {
  id: number;
  part: string;
  partHe: string;
  titleEn: string;
  titleHe: string;
  descriptionEn: string;
  descriptionHe: string;
  image: string;
  video?: string;
  accentColor: string;
  hudLabel: string;
  dataLine?: string;
  panelPosition: PanelPosition;
}

/* ─── Scene Data ──────────────────────────────────────────────────── */

const scenes: Scene[] = [
  {
    id: 0,
    part: "",
    partHe: "",
    titleEn: "Intelligence Department",
    titleHe: "מערכות מודיעין",
    descriptionEn: "",
    descriptionHe: "",
    image: "/presentations/x_pres/frames/frame-opening.webp",
    video: "/presentations/x_pres/videos/opening.mp4",
    accentColor: "#00D4FF",
    hudLabel: "",
    panelPosition: "bottom-center",
  },
  {
    id: 1,
    part: "PART 1 — THE THREAT",
    partHe: "חלק 1 — האיום",
    titleEn: "THE APPROACHING THREAT",
    titleHe: "האיום המתקרב",
    descriptionEn:
      "A lone hostile operative moves through rugged terrain under cover of twilight, approaching an Israeli military outpost. He believes he is undetected.",
    descriptionHe:
      "גורם עוין בודד נע בשטח סלעי תחת כיסוי של בין ערביים, מתקרב לעמדה צבאית ישראלית. הוא משוכנע שלא זוהה.",
    image: "/presentations/x_pres/frames/frame-0001.webp",
    video: "/presentations/x_pres/videos/1.mp4",
    accentColor: "#FFB830",
    hudLabel: "SCENE 01 // INFILTRATION DETECTED",
    dataLine: "COORD: 31.2588° N, 34.7997° E | THREAT: UNIDENTIFIED",
    panelPosition: "bottom-right",
  },
  {
    id: 2,
    part: "PART 2 — THE ALERT",
    partHe: "חלק 2 — ההתרעה",
    titleEn: "THE COMMAND CENTER AWAKENS",
    titleHe: "חדר המצב מתעורר",
    descriptionEn:
      "Deep inside a fortified command center, multiple screens flash with a new intelligence alert. Officers turn their attention to the incoming threat data.",
    descriptionHe:
      "עמוק בתוך חדר מצב מבוצר, מסכים רבים מהבהבים עם התרעת מודיעין חדשה. קצינים מפנים תשומת לבם לאיום.",
    image: "/presentations/x_pres/frames/frame-0002.webp",
    video: "/presentations/x_pres/videos/2.mp4",
    accentColor: "#00D4FF",
    hudLabel: "SCENE 02 // ALERT TRIGGERED",
    dataLine: "STATUS: C4I ACTIVE | THREAT LEVEL: ELEVATED",
    panelPosition: "bottom-left",
  },
  {
    id: 3,
    part: "PART 3 — INTELLIGENCE",
    partHe: "חלק 3 — מודיעין",
    titleEn: "INTEL RESEARCH SOFTWARE",
    titleHe: "תוכנת מחקר מודיעיני",
    descriptionEn:
      "The Intel Research platform springs to life — analysts cross-reference the hostile operative against classified databases. Predictive models estimate location with 87.3% confidence.",
    descriptionHe:
      "פלטפורמת מחקר המודיעין קמה לחיים — אנליסטים מצליבים את הגורם העוין מול מאגרי מידע מסווגים. מודלים חזויים מעריכים מיקום ברמת וודאות של 87.3%.",
    image: "/presentations/x_pres/frames/frame-0006.webp",
    video: "/presentations/x_pres/videos/3.mp4",
    accentColor: "#00D4FF",
    hudLabel: "SCENE 03 // ANALYSIS ACTIVE",
    dataLine: "MATCH CONFIDENCE: 87.3% | DATABASES: 14 CROSS-REFERENCED",
    panelPosition: "bottom-left",
  },
  {
    id: 4,
    part: "PART 4 — THE DECISION",
    partHe: "חלק 4 — ההחלטה",
    titleEn: "COMMAND DECISION",
    titleHe: "ההחלטה",
    descriptionEn:
      "The commanding officer reviews the intelligence findings. Location confirmed, threat validated. The decision is made: deploy drones to intercept.",
    descriptionHe:
      "המפקד סוקר את ממצאי המודיעין. המיקום אושר, האיום מאומת. ההחלטה מתקבלת: לשגר רחפנים ליירוט.",
    image: "/presentations/x_pres/frames/frame-0007.webp",
    video: "/presentations/x_pres/videos/4.mp4",
    accentColor: "#FFB830",
    hudLabel: "SCENE 04 // AUTHORITY CONFIRMED",
    dataLine: "OPERATION AUTHORITY: CONFIRMED | BIOMETRIC: VERIFIED",
    panelPosition: "bottom-left",
  },
  {
    id: 5,
    part: "PART 5 — DEPLOYMENT",
    partHe: "חלק 5 — שיגור",
    titleEn: "DRONES DISPATCHED",
    titleHe: "רחפנים ממריאים",
    descriptionEn:
      "Following the general's order, intelligence drones launch from the ground station. Three assets airborne — heading to the predicted location.",
    descriptionHe:
      "בעקבות פקודת המפקד, רחפני מודיעין ממריאים מתחנת הקרקע. שלושה כלים באוויר — בדרך למיקום החזוי.",
    image: "/presentations/x_pres/frames/frame-0008.webp",
    video: "/presentations/x_pres/videos/5.mp4",
    accentColor: "#00E676",
    hudLabel: "SCENE 05 // ASSETS DEPLOYED",
    dataLine: "EAGLE-1: ALT 2400m | EAGLE-2: ALT 1800m | EAGLE-3: STANDBY",
    panelPosition: "bottom-left",
  },
  {
    id: 6,
    part: "PART 6 — CYBER ATTACK",
    partHe: "חלק 6 — מתקפת סייבר",
    titleEn: "CYBER ATTACK DETECTED",
    titleHe: "מתקפת סייבר זוהתה",
    descriptionEn:
      "Communications with drones are severed. The NSOC detects a coordinated cyber attack — RF jamming combined with network intrusion targeting drone links.",
    descriptionHe:
      "התקשורת עם הרחפנים נותקה. מערך הסייבר הלאומי מזהה מתקפת סייבר מתואמת — הפרעת RF בשילוב חדירה לרשת התקשורת.",
    image: "/presentations/x_pres/frames/frame-0009.webp",
    video: "/presentations/x_pres/videos/6.mp4",
    accentColor: "#FF2E3B",
    hudLabel: "SCENE 06 // BREACH DETECTED",
    dataLine: "⚠ COMM LINK SEVERED | VECTOR: RF JAM + NETWORK INTRUSION",
    panelPosition: "bottom-left",
  },
  {
    id: 7,
    part: "PART 7 — DEFENSE",
    partHe: "חלק 7 — הגנה",
    titleEn: "DEFENSIVE PLAYBOOK ACTIVATED",
    titleHe: "הפעלת תרחיש הגנתי",
    descriptionEn:
      "An NSOC operator calmly activates a pre-configured defensive playbook. Automated countermeasures deploy. Attack neutralized. Comms restored.",
    descriptionHe:
      "מפעיל במערך הסייבר מפעיל בשלווה תרחיש הגנתי מוכן מראש. אמצעי נגד אוטומטיים נפרסים. המתקפה נוטרלה. התקשורת שוחזרה.",
    image: "/presentations/x_pres/frames/frame-0004.webp",
    video: "/presentations/x_pres/videos/7.mp4",
    accentColor: "#00E676",
    hudLabel: "SCENE 07 // THREAT MITIGATED",
    dataLine: "PLAYBOOK: COMM-SHIELD ALPHA | EFFICACY: 94.7% | STATUS: RESTORED",
    panelPosition: "bottom-right",
  },
  {
    id: 8,
    part: "PART 8 — EYES ON TARGET",
    partHe: "חלק 8 — עיניים על המטרה",
    titleEn: "TARGET ACQUIRED",
    titleHe: "המטרה אותרה",
    descriptionEn:
      "Drone communications restored. VISINT sensors lock onto the target. Crystal-clear surveillance footage streams to command — confidence 96.4%.",
    descriptionHe:
      "התקשורת עם הרחפנים שוחזרה. חיישני VISINT ננעלים על המטרה. צילומי מעקב חדים זורמים לפיקוד — וודאות 96.4%.",
    image: "/presentations/x_pres/frames/frame-0010.webp",
    video: "/presentations/x_pres/videos/8.mp4",
    accentColor: "#00D4FF",
    hudLabel: "SCENE 08 // TRACKING ACTIVE",
    dataLine: "TGT-001 | CONFIDENCE: 96.4% | SPEED: 1.2 m/s | DIST: 3.7km",
    panelPosition: "bottom-right",
  },
  {
    id: 9,
    part: "PART 9 — CAPTURE",
    partHe: "חלק 9 — לכידה",
    titleEn: "TARGET SURRENDERS",
    titleHe: "המטרה נכנעת",
    descriptionEn:
      "Three drones converge in triangular formation. Spotlights illuminate from above. Surrounded, no escape — the target drops to his knees.",
    descriptionHe:
      "שלושה רחפנים מתכנסים במשולש. זרקורים מאירים מלמעלה. מוקף, ללא מנוס — המטרה כורעת על ברכיו.",
    image: "/presentations/x_pres/frames/frame-0011.webp",
    video: "/presentations/x_pres/videos/9.mp4",
    accentColor: "#00E676",
    hudLabel: "SCENE 09 // TARGET NEUTRALIZED",
    dataLine: "FORMATION: TRIANGLE | STATUS: SURRENDERED | THREAT: CONTAINED",
    panelPosition: "bottom-left",
  },
  {
    id: 10,
    part: "PART 10 — AI ANALYSIS",
    partHe: "חלק 10 — ניתוח AI",
    titleEn: "AI INVESTIGATION FRAMEWORK",
    titleHe: "מסגרת חקירת בינה מלאכותית",
    descriptionEn:
      "Back at HQ — the Agent-to-Agent AI framework ingests all operational data. Multiple AI agents collaborate autonomously to investigate the full operation.",
    descriptionHe:
      "חזרה למטה — מסגרת ה-AI סוכן-לסוכן מעבדת את כל הנתונים המבצעיים. סוכני AI מרובים משתפים פעולה באופן אוטונומי לחקירת המבצע.",
    image: "/presentations/x_pres/frames/frame-0005.webp",
    video: "/presentations/x_pres/videos/10.mp4",
    accentColor: "#3D7BFF",
    hudLabel: "SCENE 10 // AGENTS ACTIVE",
    dataLine: "AGENTS: 5 ACTIVE | DATA: 2.4TB PROCESSED | ANOMALIES: 3 FLAGGED",
    panelPosition: "bottom-right",
  },
  {
    id: 11,
    part: "PART 11 — FINDINGS",
    partHe: "חלק 11 — ממצאים",
    titleEn: "AI FINDINGS DASHBOARD",
    titleHe: "לוח ממצאי הבינה המלאכותית",
    descriptionEn:
      "Investigation complete. A conversational AI agent presents findings through interactive visual dashboards — timelines, entity maps, root cause analysis.",
    descriptionHe:
      "החקירה הושלמה. סוכן שיחה מציג ממצאים דרך לוחות מחוונים ויזואליים אינטראקטיביים — צירי זמן, מפות ישויות, ניתוח שורש.",
    image: "/presentations/x_pres/frames/frame-0012.webp",
    video: "/presentations/x_pres/videos/11.mp4",
    accentColor: "#00D4FF",
    hudLabel: "SCENE 11 // FINDINGS COMPLETE",
    dataLine: "THREAT GROUP: VORTEX-7 | CONFIDENCE: 91% | VECTORS: 2 IDENTIFIED",
    panelPosition: "bottom-left",
  },
  {
    id: 12,
    part: "PART 12 — PHILOSOPHY",
    partHe: "חלק 12 — פילוסופיה",
    titleEn: "RESPONSIBLE AI DEVELOPMENT",
    titleHe: "פיתוח AI אחראי",
    descriptionEn:
      "Built on four pillars — Traceability, Ownership, Reproducibility, Accountability. Every decision logged. Every action traced from intent to deployment. Humans remain the authority.",
    descriptionHe:
      "בנוי על ארבעה עמודים — יכולת מעקב, בעלות, יכולת שחזור, אחריותיות. כל החלטה מתועדת. כל פעולה עוקבת מכוונה ועד פריסה. בני האדם נותרים הסמכות.",
    image: "/presentations/x_pres/frames/frame-0013.webp?v=2",
    accentColor: "#FFB830",
    hudLabel: "SCENE 12 // DEVELOPMENT PHILOSOPHY",
    dataLine: "TRACEABILITY | OWNERSHIP | REPRODUCIBILITY | ACCOUNTABILITY",
    panelPosition: "bottom-left",
  },
  {
    id: 15,
    part: "TECH STACK",
    partHe: "סביבה טכנולוגית",
    titleEn: "TECH STACK",
    titleHe: "Tech Stack",
    descriptionEn:
      "Our technology foundation — from cloud infrastructure and AI frameworks to real-time data pipelines and edge computing.",
    descriptionHe:
      "התשתית הטכנולוגית שלנו — מתשתיות ענן ומסגרות בינה מלאכותית ועד צינורות נתונים בזמן אמת ומחשוב קצה.",
    image: "/presentations/x_pres/frames/frame-techstack.webp",
    accentColor: "#3D7BFF",
    hudLabel: "SCENE 13 // TECHNOLOGY FOUNDATION",
    dataLine: "CLOUD | AI/ML | REAL-TIME | EDGE COMPUTING",
    panelPosition: "bottom-left",
  },
  {
    id: 14,
    part: "",
    partHe: "",
    titleEn: "THANK YOU",
    titleHe: "תודה",
    descriptionEn: "",
    descriptionHe: "",
    image: "/presentations/x_pres/frames/frame-0014.webp",
    video: "/presentations/x_pres/videos/1.1.mp4",
    accentColor: "#00D4FF",
    hudLabel: "",
    panelPosition: "bottom-center",
  },
];

/* ─── Thank-You Grid — all scene videos in a surrounding grid ───── */

const thankYouGridVideos = [
  "/presentations/x_pres/videos/opening.mp4",
  "/presentations/x_pres/videos/1.mp4",
  "/presentations/x_pres/videos/2.mp4",
  "/presentations/x_pres/videos/3.mp4",
  "/presentations/x_pres/videos/4.mp4",
  "/presentations/x_pres/videos/5.mp4",
  "/presentations/x_pres/videos/6.mp4",
  "/presentations/x_pres/videos/7.mp4",
  "/presentations/x_pres/videos/8.mp4",
  "/presentations/x_pres/videos/9.mp4",
  "/presentations/x_pres/videos/10.mp4",
  "/presentations/x_pres/videos/11.mp4",
];

const thankYouGridImages = [
  "/presentations/x_pres/frames/frame-opening.webp",
  "/presentations/x_pres/frames/frame-0001.webp",
  "/presentations/x_pres/frames/frame-0002.webp",
  "/presentations/x_pres/frames/frame-0006.webp",
  "/presentations/x_pres/frames/frame-0007.webp",
  "/presentations/x_pres/frames/frame-0008.webp",
  "/presentations/x_pres/frames/frame-0009.webp",
  "/presentations/x_pres/frames/frame-0004.webp",
  "/presentations/x_pres/frames/frame-0010.webp",
  "/presentations/x_pres/frames/frame-0011.webp",
  "/presentations/x_pres/frames/frame-0005.webp",
  "/presentations/x_pres/frames/frame-0012.webp",
];

const DeadDropTransition = lazy(() => import("./transitions/DeadDropTransition"));
const OrbitalTransition  = lazy(() => import("./transitions/OrbitalTransition"));
const ConsensusTransition = lazy(() => import("./transitions/ConsensusTransition"));

/* ─── Signal Strength Indicator ───────────────────────────────────── */

function SignalStrength({ sceneId }: { sceneId: number }) {
  const getStrength = (id: number) => {
    if (id === 6) return [3, 2, 0, 0, 0];
    if (id === 7) return [8, 6, 5, 3, 2];
    return [12, 10, 8, 6, 4];
  };
  const bars = getStrength(sceneId);
  return (
    <div className="x-pres-hud-signal">
      {bars.map((h, i) => (
        <div key={i} className="x-pres-hud-signal-bar" style={{ height: `${h}px` }} />
      ))}
    </div>
  );
}

/* ─── Thank You Grid Component ────────────────────────────────────── */

function ThankYouGrid({ mediaMode, language }: { mediaMode: MediaMode; language: Language }) {
  const titleText = language === "he" ? "תודה רבה" : "THANK YOU";
  const isHebrew = language === "he";

  // 4x4 grid: positions 0-15, center 4 cells (5,6,9,10) are the title
  // That leaves 12 surrounding cells for videos
  const centerCells = new Set([5, 6, 9, 10]);
  let videoIdx = 0;

  return (
    <div className="x-pres-thankyou-grid">
      {Array.from({ length: 16 }, (_, i) => {
        if (centerCells.has(i)) {
          // Render center "Thank You" box only once (at position 5)
          if (i === 5) {
            return (
              <div key={i} className="x-pres-thankyou-center" style={{ gridColumn: "2 / 4", gridRow: "2 / 4" }}>
                <div className="x-pres-thankyou-center-inner">
                  <h1
                    className="x-pres-thankyou-title"
                    style={isHebrew ? { direction: "rtl" } : {}}
                  >
                    {titleText}
                  </h1>
                  <div className="x-pres-thankyou-subtitle" />
                </div>
              </div>
            );
          }
          return null; // Skip other center cells (merged)
        }
        const idx = videoIdx++;
        const videoSrc = thankYouGridVideos[idx % thankYouGridVideos.length];
        const imageSrc = thankYouGridImages[idx % thankYouGridImages.length];
        return (
          <div key={i} className="x-pres-thankyou-cell">
            {mediaMode === "video" ? (
              <video
                src={videoSrc}
                muted
                autoPlay
                playsInline
                loop
                className="x-pres-thankyou-cell-media"
              />
            ) : (
              <div
                className="x-pres-thankyou-cell-media"
                style={{ backgroundImage: `url(${imageSrc})`, backgroundSize: "cover", backgroundPosition: "center" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Register GSAP plugins ───────────────────────────────────────── */

gsap.registerPlugin(Observer);

/* ─── Active transition state ─────────────────────────────────────── */

interface ActiveTransition {
  fromIndex: number;
  toIndex: number;
  direction: 1 | -1;
  key: number;
}

/* ─── Main Component ──────────────────────────────────────────────── */

export default function XPresPage() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [scrollMode, setScrollMode] = useState<ScrollMode>("gsap");
  const [language, setLanguage] = useState<Language>("he");
  const [prevImage, setPrevImage] = useState<string>("");
  const [prevVideo, setPrevVideo] = useState<string>("");
  const [prevVisible, setPrevVisible] = useState(false);
  const [autoplayProgress, setAutoplayProgress] = useState(0);
  const [mediaMode, setMediaMode] = useState<MediaMode>("video");
  const [transitionVersion, setTransitionVersion] = useState<TransitionVersion>("A");
  const [activeTransition, setActiveTransition] = useState<ActiveTransition | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const transitionKeyRef = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevBgRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const isTransitioningRef = useRef(false);
  const currentSceneRef = useRef(0);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const gsapObserverRef = useRef<ReturnType<typeof Observer.create> | null>(null);
  const videoBgRef = useRef<VideoBackgroundHandle | null>(null);
  const openingLineRef = useRef<HTMLDivElement>(null);
  const openingEnRef = useRef<HTMLHeadingElement>(null);
  const openingHeRef = useRef<HTMLParagraphElement>(null);
  const openingPlayedRef = useRef(false);

  // Language persistence
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("x-pres-lang") : null;
    if (saved === "en" || saved === "he" || saved === "both") setLanguage(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("x-pres-lang", language);
  }, [language]);

  // Preload images
  useEffect(() => {
    let loaded = 0;
    const total = scenes.length;
    scenes.forEach((scene) => {
      const img = new Image();
      const onDone = () => {
        loaded++;
        setLoadProgress(Math.round((loaded / total) * 100));
        if (loaded === total) setTimeout(() => setImagesLoaded(true), 400);
      };
      img.onload = onDone;
      img.onerror = onDone;
      img.src = scene.image;
    });
  }, []);

  // Keep currentSceneRef in sync
  useEffect(() => {
    currentSceneRef.current = currentScene;
  }, [currentScene]);

  /* ─── Image transition (existing GSAP approach) ───────────────── */

  const doImageTransition = useCallback((nextIndex: number, dir: number) => {
    if (isTransitioningRef.current) return;
    if (nextIndex < 0 || nextIndex >= scenes.length) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);

    const panelEl = panelRef.current;
    if (panelEl) {
      gsap.killTweensOf(panelEl);
      gsap.to(panelEl, { opacity: 0, y: dir * -28, duration: 0.2, ease: "power2.in" });
    }

    setTimeout(() => {
      setPrevImage(scenes[currentSceneRef.current].image);
      setPrevVisible(true);
      setCurrentScene(nextIndex);
      currentSceneRef.current = nextIndex;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const prevEl = prevBgRef.current;
          if (prevEl) {
            gsap.killTweensOf(prevEl);
            gsap.fromTo(
              prevEl,
              { opacity: 1, y: 0, scale: 1 },
              {
                opacity: 0, y: dir * -110, scale: 0.93, duration: 0.72, ease: "power3.inOut",
                onComplete: () => {
                  setPrevVisible(false);
                  isTransitioningRef.current = false;
                  setIsTransitioning(false);
                },
              }
            );
          } else {
            setPrevVisible(false);
            isTransitioningRef.current = false;
            setIsTransitioning(false);
          }

          const newPanel = panelRef.current;
          if (newPanel) {
            gsap.killTweensOf(newPanel);
            gsap.fromTo(
              newPanel,
              { opacity: 0, y: dir * 36 },
              { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", delay: 0.1 }
            );
          }
        });
      });
    }, 210);
  }, []);

  /* ─── Video transition dispatcher ────────────────────────────── */

  const doVideoTransition = useCallback((nextIndex: number, dir: number) => {
    if (isTransitioningRef.current) return;
    if (nextIndex < 0 || nextIndex >= scenes.length) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);

    // Set previous video to current scene's video
    const prevSrc = scenes[currentSceneRef.current].video || scenes[currentSceneRef.current].image;
    setPrevVideo(prevSrc);
    setPrevVisible(true);

    // Panel exit
    const panelEl = panelRef.current;
    if (panelEl) {
      gsap.killTweensOf(panelEl);
      gsap.to(panelEl, { opacity: 0, y: dir * -28, duration: 0.2, ease: "power2.in" });
    }

    // Launch the transition component
    transitionKeyRef.current += 1;
    setActiveTransition({
      fromIndex: currentSceneRef.current,
      toIndex: nextIndex,
      direction: dir as 1 | -1,
      key: transitionKeyRef.current,
    });
  }, []);

  /* ─── Video switch callback (called mid-transition) ──────────── */

  const handleVideoSwitch = useCallback(() => {
    const next = activeTransition?.toIndex ?? currentSceneRef.current;
    setCurrentScene(next);
    currentSceneRef.current = next;
    setPrevVisible(false);

    // Panel enter
    const newPanel = panelRef.current;
    if (newPanel) {
      gsap.killTweensOf(newPanel);
      gsap.fromTo(
        newPanel,
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", delay: 0.1 }
      );
    }
  }, [activeTransition]);

  /* ─── Transition complete callback ──────────────────────────── */

  const handleTransitionComplete = useCallback(() => {
    setActiveTransition(null);
    isTransitioningRef.current = false;
    setIsTransitioning(false);
    setPrevVisible(false);
  }, []);

  /* ─── Unified transition entry ────────────────────────────────── */

  const doGsapTransition = useCallback((nextIndex: number, dir: number) => {
    const fromScene = scenes[currentSceneRef.current];
    const toScene = scenes[nextIndex];
    if (mediaMode === "video" && fromScene.video && toScene.video) {
      doVideoTransition(nextIndex, dir);
    } else {
      doImageTransition(nextIndex, dir);
    }
  }, [mediaMode, doVideoTransition, doImageTransition]);

  // Autoplay
  useEffect(() => {
    if (scrollMode === "autoplay") {
      setAutoplayProgress(0);
      const progressInterval = setInterval(() => {
        setAutoplayProgress((p) => (p >= 100 ? 0 : p + 100 / 60));
      }, 100);
      autoplayRef.current = setInterval(() => {
        doGsapTransition((currentSceneRef.current + 1) % scenes.length, 1);
        setAutoplayProgress(0);
      }, 6000);
      return () => {
        clearInterval(progressInterval);
        if (autoplayRef.current) clearInterval(autoplayRef.current);
      };
    } else {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
      setAutoplayProgress(0);
    }
  }, [scrollMode, doGsapTransition]);

  // GSAP Observer
  useEffect(() => {
    if (scrollMode !== "gsap") {
      gsapObserverRef.current?.kill();
      gsapObserverRef.current = null;
      return;
    }
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    gsapObserverRef.current = Observer.create({
      type: "wheel,touch,pointer",
      onDown: () => {
        const curr = currentSceneRef.current;
        if (curr < scenes.length - 1) doGsapTransition(curr + 1, 1);
      },
      onUp: () => {
        const curr = currentSceneRef.current;
        if (curr > 0) doGsapTransition(curr - 1, -1);
      },
      wheelSpeed: -1,
      tolerance: 10,
      preventDefault: true,
    });

    return () => {
      gsapObserverRef.current?.kill();
      gsapObserverRef.current = null;
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [scrollMode, doGsapTransition]);

  // Continuous mode
  useEffect(() => {
    if (scrollMode !== "continuous") return;
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const idx = Number(entry.target.getAttribute("data-scene-index"));
            if (!isNaN(idx)) setCurrentScene(idx);
          }
        });
      },
      { threshold: 0.5 }
    );
    sceneRefs.current.forEach((el) => { if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, [scrollMode, imagesLoaded]);

  // Autoplay scroll lock
  useEffect(() => {
    if (scrollMode !== "autoplay") return;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [scrollMode]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const goNext = e.key === "ArrowDown" || e.key === " " || e.key === "ArrowRight" || e.key === "PageDown";
      const goPrev = e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp";
      const goHome = e.key === "Home";
      const goEnd  = e.key === "End";
      if (!goNext && !goPrev && !goHome && !goEnd) return;
      e.preventDefault();
      const curr = currentSceneRef.current;
      if (scrollMode === "gsap" || scrollMode === "autoplay") {
        if (goNext && curr < scenes.length - 1) doGsapTransition(curr + 1, 1);
        else if (goPrev && curr > 0) doGsapTransition(curr - 1, -1);
        else if (goHome && curr !== 0) doGsapTransition(0, -1);
        else if (goEnd  && curr !== scenes.length - 1) doGsapTransition(scenes.length - 1, 1);
      } else {
        if (goNext) setCurrentScene((s) => Math.min(s + 1, scenes.length - 1));
        else if (goPrev) setCurrentScene((s) => Math.max(s - 1, 0));
        else if (goHome) setCurrentScene(0);
        else if (goEnd)  setCurrentScene(scenes.length - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [scrollMode, doGsapTransition]);

  /* ─── Opening slide GSAP animation ──────────────────────────────── */

  useEffect(() => {
    if (currentScene !== 0) return;
    const titleEl = language === "he" ? openingHeRef.current : openingEnRef.current;
    const lineEl = openingLineRef.current;
    if (!titleEl || !lineEl) return;

    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      gsap.set([titleEl, lineEl], { opacity: 1 });
      gsap.set(lineEl, { width: 80 });
      openingPlayedRef.current = true;
      return;
    }

    // Entrance timeline
    const tl = gsap.timeline({
      delay: 0.4,
      onComplete: () => {
        openingPlayedRef.current = true;
        // Persistent subtle "alive" animation — gentle glow pulse + breathing
        breathTl = gsap.timeline({ repeat: -1, yoyo: true });
        breathTl
          .to(titleEl, {
            textShadow: "0 0 30px rgba(0, 212, 255, 0.3), 0 2px 24px rgba(0, 0, 0, 0.85)",
            letterSpacing: language === "he" ? "0.08em" : "0.20em",
            duration: 3,
            ease: "sine.inOut",
          })
          .to(lineEl, {
            boxShadow: "0 0 20px rgba(0, 212, 255, 0.6)",
            width: 100,
            duration: 3,
            ease: "sine.inOut",
          }, 0);
      },
    });

    let breathTl: gsap.core.Timeline | null = null;

    // Reset state
    gsap.set(titleEl, { opacity: 0, y: 28, scale: 1.02, filter: "blur(10px)", clipPath: "inset(0 0 100% 0)" });
    gsap.set(lineEl, { opacity: 0, width: 0 });

    tl.fromTo(lineEl,
      { opacity: 0, width: 0 },
      { opacity: 1, width: 80, duration: 0.6, ease: "power2.out" }
    )
    .fromTo(titleEl,
      { opacity: 0, y: 28, scale: 1.02, filter: "blur(10px)", clipPath: "inset(0 0 100% 0)" },
      { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", clipPath: "inset(0 0 0% 0)", duration: 1.1, ease: "power3.out" },
      0.15
    );

    return () => {
      tl.kill();
      if (breathTl) breathTl.kill();
    };
  }, [currentScene, imagesLoaded, language]);

  const scene = scenes[currentScene];
  const isRTL = language === "he";
  const isOpeningSlide = currentScene === 0;
  const isThankYou = scene.titleEn === "THANK YOU";
  const title = language === "he" ? scene.titleHe : scene.titleEn;
  const description = language === "he" ? scene.descriptionHe : scene.descriptionEn;
  const partLabel = language === "he" ? scene.partHe : scene.part;

  /* ─── Get transition component for active transition ─────────── */

  const getTransitionComponent = () => {
    if (!activeTransition) return null;
    const from = scenes[activeTransition.fromIndex];
    const to = scenes[activeTransition.toIndex];
    const commonProps = {
      fromScene: from,
      toScene: to,
      direction: activeTransition.direction,
      prevVideoRef: { current: videoBgRef.current?.prevVideoEl ?? null } as React.RefObject<HTMLVideoElement | null>,
      currentVideoRef: { current: videoBgRef.current?.currentVideoEl ?? null } as React.RefObject<HTMLVideoElement | null>,
      onVideoSwitch: handleVideoSwitch,
      onComplete: handleTransitionComplete,
    };

    return (
      <Suspense fallback={null}>
        {transitionVersion === "A" && <DeadDropTransition key={activeTransition.key} {...commonProps} />}
        {transitionVersion === "B" && <OrbitalTransition  key={activeTransition.key} {...commonProps} />}
        {transitionVersion === "C" && <ConsensusTransition key={activeTransition.key} {...commonProps} />}
      </Suspense>
    );
  };

  /* ─── Loading Screen ───────────────────────────────────────────── */
  if (!imagesLoaded) {
    return (
      <div className="x-pres-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 56, height: 56, border: "2px solid rgba(0,212,255,0.15)",
            borderTopColor: "#00D4FF", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 24px",
          }} />
          <div style={{ fontFamily: "var(--x-pres-font-mono)", fontSize: 11, color: "#00D4FF", letterSpacing: 4 }}>
            LOADING OPERATIONAL BRIEFING
          </div>
          <div style={{ width: 200, height: 2, background: "rgba(0,212,255,0.1)", borderRadius: 1, margin: "16px auto", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${loadProgress}%`, background: "#00D4FF", transition: "width 0.3s", boxShadow: "0 0 8px #00D4FF" }} />
          </div>
          <div style={{ fontFamily: "var(--x-pres-font-mono)", fontSize: 10, color: "#64748B" }}>{loadProgress}%</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  /* ─── Main Render ──────────────────────────────────────────────── */
  return (
    <div
      ref={containerRef}
      className={`x-pres-container ${scrollMode === "continuous" ? "mode-continuous" : ""}`}
    >
      <div className="x-pres-scanlines" aria-hidden="true" />

      {scrollMode === "continuous" ? (
        /* ─── Continuous Mode ─── */
        <>
          {scenes.map((s, i) => {
            const isActive = i === currentScene;
            const sTitle = language === "he" ? s.titleHe : s.titleEn;
            const sDesc  = language === "he" ? s.descriptionHe : s.descriptionEn;
            const sPart  = language === "he" ? s.partHe : s.part;
            return (
              <div
                key={s.id}
                ref={(el) => { sceneRefs.current[i] = el; }}
                data-scene-index={i}
                className="x-pres-scene"
                style={{ position: "relative", height: "100vh", width: "100%", overflow: "hidden" }}
              >
                {mediaMode === "video" && s.video ? (
                  <video
                    src={s.video}
                    muted autoPlay playsInline loop
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="x-pres-frame-bg"
                    style={{ backgroundImage: `url(${s.image})`, position: "absolute", inset: 0, backgroundSize: "cover", backgroundPosition: "center" }}
                  />
                )}
                <div className="x-pres-frame-overlay" style={{ position: "absolute", inset: 0 }} />
                {i === 0 ? (
                  /* Opening slide in continuous mode */
                  <div className="x-pres-opening" style={{ position: "absolute" }}>
                    <div className="x-pres-opening-veil" />
                    <div className="x-pres-opening-content">
                      <div className="x-pres-opening-line" style={{ opacity: 1, width: 80 }} />
                      {language === "he" ? (
                        <h1 className="x-pres-opening-title-he" style={{ opacity: 1, fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
                          מערכות מודיעין
                        </h1>
                      ) : (
                        <h1 className="x-pres-opening-title-en" style={{ opacity: 1 }}>
                          Intelligence Department
                        </h1>
                      )}
                    </div>
                  </div>
                ) : s.titleEn === "THANK YOU" ? (
                  /* Thank You grid in continuous mode */
                  <ThankYouGrid mediaMode={mediaMode} language={language} />
                ) : (
                <div
                  className={`x-pres-content ${s.panelPosition} ${isRTL ? "rtl" : ""}`}
                  style={{ position: "absolute", opacity: isActive ? 1 : 0.4, transition: "opacity 0.5s" }}
                >
                  {sPart && <div className="x-pres-label" style={{ color: s.accentColor }}>{sPart}</div>}
                  <h1 className="x-pres-title">
                    {language === "both" ? (
                      <>
                        {s.titleEn}
                        <div style={{ fontSize: "0.8em", marginTop: 8, direction: "rtl", textAlign: "right" }}>{s.titleHe}</div>
                      </>
                    ) : sTitle}
                  </h1>
                  {i < 12 && (
                    <div className="x-pres-description">
                      {language === "both" ? (
                        <>
                          <p>{s.descriptionEn}</p>
                          <p style={{ direction: "rtl", textAlign: "right", marginTop: 12 }}>{s.descriptionHe}</p>
                        </>
                      ) : <p>{sDesc}</p>}
                    </div>
                  )}
                  {s.dataLine && i < 12 && (
                    <div className="x-pres-data-row">
                      <span style={{ color: "var(--x-pres-text-muted)" }}>DATA</span>
                      <span className="x-pres-data-val" style={{ color: s.accentColor }}>{s.dataLine}</span>
                    </div>
                  )}
                </div>
                )}
                {i > 0 && s.titleEn !== "THANK YOU" && (() => {
                  const contentSlides = scenes.filter((sc, idx) => idx > 0 && sc.titleEn !== "THANK YOU");
                  const displayNum = contentSlides.findIndex(sc => sc.id === s.id) + 1;
                  return (
                <div style={{
                  position: "absolute", bottom: 30, left: 30, zIndex: 80,
                  fontFamily: "var(--x-pres-font-mono)", display: "flex", alignItems: "baseline", gap: 4,
                }}>
                  <span style={{ fontSize: 24, fontWeight: 700, color: s.accentColor }}>{String(displayNum).padStart(2, "0")}</span>
                  <span style={{ fontSize: 14, color: "#64748B" }}>/{String(contentSlides.length).padStart(2, "0")}</span>
                </div>
                  );
                })()}
              </div>
            );
          })}
        </>
      ) : (
        /* ─── GSAP / Autoplay Mode ─── */
        <>
          {/* ── Background layer ── */}
          {mediaMode === "video" && scene.video ? (
            <VideoBackground
              ref={videoBgRef}
              currentSrc={scene.video}
              prevSrc={prevVideo}
              prevVisible={prevVisible}
            />
          ) : mediaMode === "video" && !scene.video ? (
            <div
              className="x-pres-frame-bg"
              style={{ backgroundImage: `url(${scene.image})`, zIndex: 1 }}
            />
          ) : (
            <>
              <div
                className="x-pres-frame-bg"
                style={{ backgroundImage: `url(${scene.image})`, zIndex: 1 }}
              />
              {prevVisible && (
                <div
                  ref={prevBgRef}
                  className="x-pres-frame-bg"
                  style={{ backgroundImage: `url(${prevImage})`, zIndex: 2 }}
                />
              )}
            </>
          )}

          <div className="x-pres-frame-overlay" style={{ zIndex: 3 }} />

          {/* ── Opening Slide Overlay ── */}
          {isOpeningSlide && (
            <div className="x-pres-opening">
              <div className="x-pres-opening-veil" />
              <div className="x-pres-opening-content">
                <div ref={openingLineRef} className="x-pres-opening-line" />
                {language === "he" ? (
                  <h1 ref={openingHeRef} className="x-pres-opening-title-he" style={{ fontSize: "clamp(2.5rem, 6vw, 5rem)" }}>
                    מערכות מודיעין
                  </h1>
                ) : (
                  <h1 ref={openingEnRef} className="x-pres-opening-title-en">
                    Intelligence Department
                  </h1>
                )}
              </div>
            </div>
          )}

          {/* ── Thank You Grid Overlay ── */}
          {isThankYou && (
            <ThankYouGrid mediaMode={mediaMode} language={language} />
          )}

          {/* ── Active video transition overlay ── */}
          {mediaMode === "video" && getTransitionComponent()}

          {/* HUD Brackets */}
          {!isOpeningSlide && !isThankYou && (
          <div className="x-pres-hud" style={{ zIndex: 80 }}>
            <div className="x-pres-hud-bracket x-pres-hud-tl" />
            <div className="x-pres-hud-bracket x-pres-hud-tr" />
            <div className="x-pres-hud-bracket x-pres-hud-bl" />
            <div className="x-pres-hud-bracket x-pres-hud-br" />
          </div>
          )}

          {/* HUD Top Label */}
          {scene.hudLabel && (
            <motion.div
              key={`hud-${currentScene}`}
              style={{
                position: "absolute", top: 50, left: "50%", transform: "translateX(-50%)",
                fontFamily: "var(--x-pres-font-mono)", fontSize: 11, fontWeight: 500,
                letterSpacing: 2.5, color: scene.accentColor, zIndex: 80,
                textShadow: `0 0 12px ${scene.accentColor}`,
              }}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.45 }}
            >
              {scene.hudLabel}
            </motion.div>
          )}

          {/* Signal + REC */}
          <div style={{ position: "absolute", bottom: 50, right: 50, zIndex: 80, display: "flex", alignItems: "center", gap: 16 }}>
            <SignalStrength sceneId={scene.id} />
            {(scene.id === 8 || scene.id === 9) && (
              <motion.div
                className="x-pres-hud-rec"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                <div className="x-pres-hud-rec-dot" />
                REC
              </motion.div>
            )}
          </div>

          {/* Content Panel */}
          {title && !isOpeningSlide && !isThankYou && (
            <div
              ref={panelRef}
              className={`x-pres-content ${scene.panelPosition} ${isRTL ? "rtl" : ""}`}
            >
              {partLabel && (
                <div className="x-pres-label" style={{ color: scene.accentColor }}>{partLabel}</div>
              )}
              <h1 className="x-pres-title" style={isThankYou ? { fontSize: "3.5rem", textAlign: "center" } : {}}>
                {language === "both" ? (
                  <>
                    {scene.titleEn}
                    <div style={{ fontSize: "0.8em", marginTop: 8, direction: "rtl", textAlign: "right" }}>{scene.titleHe}</div>
                  </>
                ) : title}
              </h1>
              {!isThankYou && (
                <div className="x-pres-description">
                  {language === "both" ? (
                    <>
                      <p>{scene.descriptionEn}</p>
                      <p style={{ direction: "rtl", textAlign: "right", marginTop: 12 }}>{scene.descriptionHe}</p>
                    </>
                  ) : <p>{description}</p>}
                </div>
              )}
              {isThankYou && (
                <div style={{ textAlign: "center", color: "var(--x-pres-text-muted)", marginTop: 16 }}>
                  {language === "both" ? (
                    <>
                      <p>{scene.descriptionEn}</p>
                      <p style={{ direction: "rtl", marginTop: 8 }}>{scene.descriptionHe}</p>
                    </>
                  ) : <p>{description}</p>}
                </div>
              )}
              {scene.dataLine && !isThankYou && (
                <div className="x-pres-data-row">
                  <span style={{ color: "var(--x-pres-text-muted)" }}>DATA</span>
                  <span className="x-pres-data-val" style={{ color: scene.accentColor }}>{scene.dataLine}</span>
                </div>
              )}
            </div>
          )}

          {/* Scene Counter */}
          {!isOpeningSlide && !isThankYou && (() => {
            const contentSlides = scenes.filter((s, idx) => idx > 0 && s.titleEn !== "THANK YOU");
            const displayNum = contentSlides.findIndex(s => s.id === scene.id) + 1;
            return (
          <div style={{
            position: "absolute", bottom: 50, left: 50, zIndex: 80,
            fontFamily: "var(--x-pres-font-mono)", display: "flex", alignItems: "baseline", gap: 4,
          }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: scene.accentColor, textShadow: `0 0 12px ${scene.accentColor}` }}>
              {String(displayNum).padStart(2, "0")}
            </span>
            <span style={{ fontSize: 18, color: "#64748B" }}>/</span>
            <span style={{ fontSize: 14, color: "#64748B" }}>{String(contentSlides.length).padStart(2, "0")}</span>
          </div>
            );
          })()}

          {/* Scroll hint */}
          {currentScene === 0 && scrollMode === "gsap" && (
            <motion.div
              style={{
                position: "absolute", bottom: 50, left: "50%", transform: "translateX(-50%)",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 10, zIndex: 80,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 3, duration: 1.5 }}
            >
              <motion.div
                style={{ width: 20, height: 20, borderRight: "2px solid #64748B", borderBottom: "2px solid #64748B", transform: "rotate(45deg)" }}
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <span style={{ fontFamily: "var(--x-pres-font-mono)", fontSize: 9, color: "#64748B", letterSpacing: 3 }}>
                SCROLL TO PROCEED
              </span>
            </motion.div>
          )}

          {/* Glitch overlay — cyber attack scene */}
          {scene.id === 6 && (
            <motion.div
              className="x-pres-glitch-overlay"
              style={{ display: "block" }}
              animate={{ opacity: [0, 0.15, 0, 0.1, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </>
      )}

      {/* ─── Menu Dot + Collapsible Controls ─── */}

      <button
        className="x-pres-menu-dot"
        style={{ background: scene.accentColor, boxShadow: `0 0 12px ${scene.accentColor}66` }}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        <motion.span
          animate={{ rotate: menuOpen ? 45 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: "block", width: "100%", height: "100%" }}
        >
          {menuOpen ? "✕" : ""}
        </motion.span>
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="x-pres-controls-wrapper"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            style={scrollMode === "continuous" ? { position: "fixed" } : {}}
          >
        {/* Scroll Mode Pill */}
        <div className="x-pres-control-pill">
          <button
            className={`x-pres-control-btn ${scrollMode === "gsap" ? "active" : ""}`}
            style={scrollMode === "gsap" ? { background: scene.accentColor } : {}}
            onClick={() => setScrollMode("gsap")}
            data-tooltip="GSAP"
            aria-label="GSAP mode"
          >
            ⬤
          </button>
          <button
            className={`x-pres-control-btn ${scrollMode === "continuous" ? "active" : ""}`}
            style={scrollMode === "continuous" ? { background: scene.accentColor } : {}}
            onClick={() => setScrollMode("continuous")}
            data-tooltip="Continuous"
            aria-label="Continuous scroll"
          >
            ≡
          </button>
          <button
            className={`x-pres-control-btn ${scrollMode === "autoplay" ? "active" : ""}`}
            style={scrollMode === "autoplay" ? { background: scene.accentColor } : {}}
            onClick={() => setScrollMode(scrollMode === "autoplay" ? "gsap" : "autoplay")}
            data-tooltip="Auto-play"
            aria-label="Auto-play mode"
          >
            {scrollMode === "autoplay" ? "⏸" : "▶"}
            {scrollMode === "autoplay" && (
              <svg className="x-pres-autoplay-ring" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" style={{ strokeDashoffset: 100 - autoplayProgress }} />
              </svg>
            )}
          </button>
        </div>

        {/* Language Pill */}
        <div className="x-pres-control-pill">
          <button
            className={`x-pres-control-btn ${language === "both" ? "active" : ""}`}
            style={language === "both" ? { background: scene.accentColor } : {}}
            onClick={() => setLanguage("both")}
            data-tooltip="Bilingual"
            aria-label="Both languages"
          >
            ⊕
          </button>
          <button
            className={`x-pres-control-btn ${language === "en" ? "active" : ""}`}
            style={language === "en" ? { background: scene.accentColor } : {}}
            onClick={() => setLanguage("en")}
            data-tooltip="English"
            aria-label="English only"
          >
            EN
          </button>
          <button
            className={`x-pres-control-btn ${language === "he" ? "active" : ""}`}
            style={language === "he" ? { background: scene.accentColor } : {}}
            onClick={() => setLanguage("he")}
            data-tooltip="עברית"
            aria-label="Hebrew only"
          >
            עב
          </button>
        </div>

        {/* Media Mode Pill — 🖼 image / 🎬 video */}
        <div className="x-pres-control-pill">
          <button
            className={`x-pres-control-btn ${mediaMode === "image" ? "active" : ""}`}
            style={mediaMode === "image" ? { background: scene.accentColor } : {}}
            onClick={() => setMediaMode("image")}
            data-tooltip="Image mode"
            aria-label="Image mode"
          >
            🖼
          </button>
          <button
            className={`x-pres-control-btn ${mediaMode === "video" ? "active" : ""}`}
            style={mediaMode === "video" ? { background: scene.accentColor } : {}}
            onClick={() => setMediaMode("video")}
            data-tooltip="Video mode"
            aria-label="Video mode"
          >
            🎬
          </button>
        </div>

        {/* Transition Version Pill — only in video mode */}
        <AnimatePresence>
          {mediaMode === "video" && (
            <motion.div
              className="x-pres-version-pill"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.25 }}
            >
              {(["A", "B", "C"] as TransitionVersion[]).map((v) => (
                <button
                  key={v}
                  className={`x-pres-version-btn ${transitionVersion === v ? "active" : ""}`}
                  style={transitionVersion === v ? { background: scene.accentColor, color: "#0D1117" } : {}}
                  onClick={() => setTransitionVersion(v)}
                  aria-label={`Transition version ${v}`}
                  data-tooltip={v === "A" ? "DEAD DROP" : v === "B" ? "ORBITAL" : "CONSENSUS"}
                >
                  {v}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation Dots */}
      <div className="x-pres-nav" style={scrollMode === "continuous" ? { position: "fixed" } : {}}>
        {scenes.map((_, i) => (
          <button
            key={i}
            className={`x-pres-nav-dot ${i === currentScene ? "active" : ""}`}
            style={i === currentScene ? { background: scene.accentColor, boxShadow: `0 0 10px ${scene.accentColor}` } : {}}
            onClick={() => {
              if (scrollMode === "continuous" && sceneRefs.current[i]) {
                sceneRefs.current[i]!.scrollIntoView({ behavior: "smooth" });
              } else {
                const curr = currentSceneRef.current;
                if (i !== curr) doGsapTransition(i, i > curr ? 1 : -1);
              }
            }}
            aria-label={`Scene ${i + 1}`}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ position: scrollMode === "continuous" ? "fixed" : "absolute", top: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.05)", zIndex: 90 }}>
        <motion.div
          style={{ height: "100%", background: scene.accentColor, boxShadow: `0 0 8px ${scene.accentColor}`, borderRadius: "0 2px 2px 0" }}
          animate={{ width: `${((currentScene + 1) / scenes.length) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}
