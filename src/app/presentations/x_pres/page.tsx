"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./styles.css";

/* ─── Types ───────────────────────────────────────────────────────── */

type ScrollMode = "section" | "continuous" | "autoplay";
type Language = "both" | "en" | "he";
type PanelPosition = "bottom-left" | "bottom-right" | "bottom-center" | "top-left" | "top-right";

interface Scene {
  id: number;
  part: string;
  partHe: string;
  titleEn: string;
  titleHe: string;
  descriptionEn: string;
  descriptionHe: string;
  image: string;
  accentColor: string;
  hudLabel: string;
  dataLine?: string;
  panelPosition: PanelPosition;
}

/* ─── Scene Data ──────────────────────────────────────────────────── */

const scenes: Scene[] = [
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
    image: "/presentations/x_pres/frames/frame-0003.webp",
    accentColor: "#00D4FF",
    hudLabel: "SCENE 03 // ANALYSIS ACTIVE",
    dataLine: "MATCH CONFIDENCE: 87.3% | DATABASES: 14 CROSS-REFERENCED",
    panelPosition: "bottom-left",
  },
  {
    id: 4,
    part: "PART 4 — DEPLOYMENT",
    partHe: "חלק 4 — שיגור",
    titleEn: "DRONES DISPATCHED",
    titleHe: "כטב״מים ממריאים",
    descriptionEn:
      "The command has a predicted location. Intelligence drones are deployed to locate and confirm the target visually. Three assets airborne.",
    descriptionHe:
      "לפיקוד יש מיקום חזוי. כטב״מי מודיעין נשלחים לאתר ולאשר את המטרה חזותית. שלושה כלים באוויר.",
    image: "/presentations/x_pres/frames/frame-0004.webp",
    accentColor: "#00E676",
    hudLabel: "SCENE 04 // ASSETS DEPLOYED",
    dataLine: "EAGLE-1: ALT 2400m | EAGLE-2: ALT 1800m | EAGLE-3: STANDBY",
    panelPosition: "bottom-right",
  },
  {
    id: 5,
    part: "PART 5 — CYBER ATTACK",
    partHe: "חלק 5 — מתקפת סייבר",
    titleEn: "CYBER ATTACK DETECTED",
    titleHe: "מתקפת סייבר זוהתה",
    descriptionEn:
      "Communications with drones are severed. The NSOC detects a coordinated cyber attack — RF jamming combined with network intrusion targeting drone links.",
    descriptionHe:
      "התקשורת עם הכטב״מים נותקה. מערך הסייבר הלאומי מזהה מתקפת סייבר מתואמת — הפרעת RF בשילוב חדירה לרשת התקשורת.",
    image: "/presentations/x_pres/frames/frame-0005.webp",
    accentColor: "#FF2E3B",
    hudLabel: "SCENE 05 // BREACH DETECTED",
    dataLine: "⚠ COMM LINK SEVERED | VECTOR: RF JAM + NETWORK INTRUSION",
    panelPosition: "bottom-left",
  },
  {
    id: 6,
    part: "PART 6 — DEFENSE",
    partHe: "חלק 6 — הגנה",
    titleEn: "DEFENSIVE PLAYBOOK ACTIVATED",
    titleHe: "הפעלת תרחיש הגנתי",
    descriptionEn:
      "An NSOC operator calmly activates a pre-configured defensive playbook. Automated countermeasures deploy. Attack neutralized. Comms restored.",
    descriptionHe:
      "מפעיל במערך הסייבר מפעיל בשלווה תרחיש הגנתי מוכן מראש. אמצעי נגד אוטומטיים נפרסים. המתקפה נוטרלה. התקשורת שוחזרה.",
    image: "/presentations/x_pres/frames/frame-0006.webp",
    accentColor: "#00E676",
    hudLabel: "SCENE 06 // THREAT MITIGATED",
    dataLine: "PLAYBOOK: COMM-SHIELD ALPHA | EFFICACY: 94.7% | STATUS: RESTORED",
    panelPosition: "bottom-right",
  },
  {
    id: 7,
    part: "PART 7 — EYES ON TARGET",
    partHe: "חלק 7 — עיניים על המטרה",
    titleEn: "TARGET ACQUIRED",
    titleHe: "המטרה אותרה",
    descriptionEn:
      "Drone communications restored. VISINT sensors lock onto the target. Crystal-clear surveillance footage streams to command — confidence 96.4%.",
    descriptionHe:
      "התקשורת עם הכטב״מים שוחזרה. חיישני VISINT ננעלים על המטרה. צילומי מעקב חדים זורמים לפיקוד — וודאות 96.4%.",
    image: "/presentations/x_pres/frames/frame-0007.webp",
    accentColor: "#00D4FF",
    hudLabel: "SCENE 07 // TRACKING ACTIVE",
    dataLine: "TGT-001 | CONFIDENCE: 96.4% | SPEED: 1.2 m/s | DIST: 3.7km",
    panelPosition: "bottom-left",
  },
  {
    id: 8,
    part: "PART 8 — THE DECISION",
    partHe: "חלק 8 — ההחלטה",
    titleEn: "COMMAND DECISION",
    titleHe: "ההחלטה",
    descriptionEn:
      "The commanding officer reviews confirmed intelligence. The weight of responsibility. The decision is made: neutralize the threat.",
    descriptionHe:
      "המפקד סוקר את המודיעין המאושר. כובד האחריות. ההחלטה מתקבלת: לנטרל את האיום.",
    image: "/presentations/x_pres/frames/frame-0008.webp",
    accentColor: "#FFB830",
    hudLabel: "SCENE 08 // AUTHORITY CONFIRMED",
    dataLine: "OPERATION AUTHORITY: CONFIRMED | BIOMETRIC: VERIFIED",
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
      "שלושה כטב״מים מתכנסים במשולש. זרקורים מאירים מלמעלה. מוקף, ללא מנוס — המטרה כורעת על ברכיו.",
    image: "/presentations/x_pres/frames/frame-0009.webp",
    accentColor: "#00E676",
    hudLabel: "SCENE 09 // TARGET NEUTRALIZED",
    dataLine: "FORMATION: TRIANGLE | STATUS: SURRENDERED | THREAT: CONTAINED",
    panelPosition: "bottom-center",
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
    image: "/presentations/x_pres/frames/frame-0010.webp",
    accentColor: "#3D7BFF",
    hudLabel: "SCENE 10 // AGENTS ACTIVE",
    dataLine: "AGENTS: 5 ACTIVE | DATA: 2.4TB PROCESSED | ANOMALIES: 3 FLAGGED",
    panelPosition: "bottom-left",
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
    image: "/presentations/x_pres/frames/frame-0011.webp",
    accentColor: "#00D4FF",
    hudLabel: "SCENE 11 // FINDINGS COMPLETE",
    dataLine: "THREAT GROUP: VORTEX-7 | CONFIDENCE: 91% | VECTORS: 2 IDENTIFIED",
    panelPosition: "bottom-right",
  },
  {
    id: 12,
    part: "PART 12 — PHILOSOPHY",
    partHe: "חלק 12 — פילוסופיה",
    titleEn: "SPEC-DRIVEN DEVELOPMENT",
    titleHe: "פיתוח מונחה מפרט",
    descriptionEn:
      "How we build — Spec-Driven Development for the agentic era. Every line traces to a spec. Humans own every decision. Full audit trail from intent to deployment.",
    descriptionHe:
      "איך אנחנו בונים — פיתוח מונחה מפרט לעידן הסוכנים. כל שורה נגזרת ממפרט. אנשים בעלי כל החלטה. מסלול ביקורת מלא מכוונה ועד פריסה.",
    image: "/presentations/x_pres/frames/frame-0012.webp",
    accentColor: "#FFB830",
    hudLabel: "SCENE 12 // DEVELOPMENT PHILOSOPHY",
    dataLine: "TRACEABILITY | OWNERSHIP | REPRODUCIBILITY | ACCOUNTABILITY",
    panelPosition: "bottom-center",
  },
  {
    id: 13,
    part: "",
    partHe: "",
    titleEn: "THANK YOU",
    titleHe: "תודה",
    descriptionEn: "Intelligence Software Department — Securing the Future Through Innovation",
    descriptionHe: "מחלקת תוכנה מודיעינית — מאבטחים את העתיד באמצעות חדשנות",
    image: "/presentations/x_pres/frames/frame-0013.webp",
    accentColor: "#00D4FF",
    hudLabel: "",
    dataLine: "SECURING THE FUTURE THROUGH INNOVATION",
    panelPosition: "bottom-center",
  },
  {
    id: 14,
    part: "",
    partHe: "",
    titleEn: "",
    titleHe: "",
    descriptionEn: "",
    descriptionHe: "",
    image: "/presentations/x_pres/frames/frame-0014.webp",
    accentColor: "#00D4FF",
    hudLabel: "",
    panelPosition: "bottom-center",
  },
];

/* ─── Utility: Decode Text Effect ─────────────────────────────────── */

function DecodeText({ text, trigger }: { text: string; trigger: number }) {
  const [displayed, setDisplayed] = useState(text);
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&*";

  useEffect(() => {
    let frame = 0;
    const totalFrames = 20;
    const interval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const decoded = text
        .split("")
        .map((char, i) => {
          if (char === " ") return " ";
          if (i / text.length < progress) return char;
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
      setDisplayed(decoded);
      if (frame >= totalFrames) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [trigger, text]);

  return <>{displayed}</>;
}

/* ─── Signal Strength Indicator ───────────────────────────────────── */

function SignalStrength({ sceneId }: { sceneId: number }) {
  const getStrength = (id: number) => {
    if (id === 5) return [3, 2, 0, 0, 0]; // Cyber attack - signal lost
    if (id === 6) return [8, 6, 5, 3, 2]; // Recovering
    return [12, 10, 8, 6, 4]; // Full signal
  };
  const bars = getStrength(sceneId);

  return (
    <div className="x-pres-hud-signal">
      {bars.map((h, i) => (
        <div
          key={i}
          className="x-pres-hud-signal-bar"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}

/* ─── Main Component ──────────────────────────────────────────────── */

export default function XPresPage() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [scrollMode, setScrollMode] = useState<ScrollMode>("section");
  const [language, setLanguage] = useState<Language>("both");
  const lastScrollTime = useRef(0);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [autoplayProgress, setAutoplayProgress] = useState(0);

  // Load language preference from localStorage
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("x-pres-lang") : null;
    if (saved === "en" || saved === "he" || saved === "both") setLanguage(saved);
  }, []);

  // Persist language preference
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

  // Autoplay mode
  useEffect(() => {
    if (scrollMode === "autoplay") {
      setAutoplayProgress(0);
      const progressInterval = setInterval(() => {
        setAutoplayProgress((p) => {
          if (p >= 100) return 0;
          return p + (100 / 60); // 6 seconds = 60 * 100ms ticks
        });
      }, 100);
      autoplayRef.current = setInterval(() => {
        setCurrentScene((s) => (s + 1) % scenes.length);
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
  }, [scrollMode]);

  const navigate = useCallback(
    (direction: "next" | "prev") => {
      if (isTransitioning || scrollMode === "autoplay") return;
      const now = Date.now();
      if (now - lastScrollTime.current < 700) return;
      lastScrollTime.current = now;

      setIsTransitioning(true);
      if (direction === "next" && currentScene < scenes.length - 1) {
        setCurrentScene((s) => s + 1);
      } else if (direction === "prev" && currentScene > 0) {
        setCurrentScene((s) => s - 1);
      }
      setTimeout(() => setIsTransitioning(false), 700);
    },
    [currentScene, isTransitioning, scrollMode]
  );

  // Lock scroll & handle wheel on document
  useEffect(() => {
    if (scrollMode === "continuous") return;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handler = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (Math.abs(e.deltaY) > 20) {
        navigate(e.deltaY > 0 ? "next" : "prev");
      }
    };
    document.addEventListener("wheel", handler, { passive: false });
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
      document.removeEventListener("wheel", handler);
    };
  }, [navigate, scrollMode]);

  // Touch navigation
  useEffect(() => {
    if (scrollMode === "continuous") return;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 40) navigate(diff > 0 ? "next" : "prev");
    };
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [navigate, scrollMode]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " " || e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        navigate("next");
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        navigate("prev");
      } else if (e.key === "Home") {
        e.preventDefault();
        setCurrentScene(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setCurrentScene(scenes.length - 1);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  const scene = scenes[currentScene];
  const isRTL = language === "he";
  const isThankYou = currentScene >= 12;

  // Determine title/description based on language
  const title = language === "he" ? scene.titleHe : scene.titleEn;
  const description = language === "he" ? scene.descriptionHe : scene.descriptionEn;
  const partLabel = language === "he" ? scene.partHe : scene.part;

  /* ─── Loading Screen ───────────────────────────────────────────── */
  if (!imagesLoaded) {
    return (
      <div className="x-pres-container" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 56, height: 56, border: "2px solid rgba(0,212,255,0.15)",
            borderTopColor: "#00D4FF", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 24px"
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
      {/* Scanlines */}
      <div className="x-pres-scanlines" aria-hidden="true" />

      {/* Background */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${currentScene}`}
          className="x-pres-frame-bg"
          style={{ backgroundImage: `url(${scene.image})` }}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      </AnimatePresence>
      <div className="x-pres-frame-overlay" />

      {/* HUD Brackets */}
      <div className="x-pres-hud">
        <div className="x-pres-hud-bracket x-pres-hud-tl" />
        <div className="x-pres-hud-bracket x-pres-hud-tr" />
        <div className="x-pres-hud-bracket x-pres-hud-bl" />
        <div className="x-pres-hud-bracket x-pres-hud-br" />
      </div>

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
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {scene.hudLabel}
        </motion.div>
      )}

      {/* HUD Bottom-Right: Signal + REC */}
      <div style={{ position: "absolute", bottom: 50, right: 50, zIndex: 80, display: "flex", alignItems: "center", gap: 16 }}>
        <SignalStrength sceneId={scene.id} />
        {(scene.id === 7 || scene.id === 9) && (
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

      {/* Controls — top right */}
      <motion.div
        className="x-pres-controls-wrapper"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        {/* Scroll Mode Pill */}
        <div className="x-pres-control-pill">
          <button
            className={`x-pres-control-btn ${scrollMode === "section" ? "active" : ""}`}
            style={scrollMode === "section" ? { background: scene.accentColor } : {}}
            onClick={() => setScrollMode("section")}
            data-tooltip="Section"
            aria-label="Section mode"
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
            onClick={() => setScrollMode(scrollMode === "autoplay" ? "section" : "autoplay")}
            data-tooltip="Auto-play"
            aria-label="Auto-play mode"
          >
            {scrollMode === "autoplay" ? "⏸" : "▶"}
            {scrollMode === "autoplay" && (
              <svg className="x-pres-autoplay-ring" viewBox="0 0 36 36">
                <circle
                  cx="18" cy="18" r="16"
                  style={{ strokeDashoffset: 100 - autoplayProgress }}
                />
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
      </motion.div>

      {/* Navigation Dots */}
      <div className="x-pres-nav">
        {scenes.map((_, i) => (
          <button
            key={i}
            className={`x-pres-nav-dot ${i === currentScene ? "active" : ""}`}
            style={i === currentScene ? { background: scene.accentColor, boxShadow: `0 0 10px ${scene.accentColor}` } : {}}
            onClick={() => { setCurrentScene(i); }}
            aria-label={`Scene ${i + 1}`}
          />
        ))}
      </div>

      {/* Content Panel */}
      <AnimatePresence mode="wait">
        {title && (
          <motion.div
            key={`content-${currentScene}-${language}`}
            className={`x-pres-content ${scene.panelPosition} ${isRTL ? "rtl" : ""}`}
            initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Part label */}
            {partLabel && (
              <div className="x-pres-label" style={{ color: scene.accentColor }}>
                {partLabel}
              </div>
            )}

            {/* Title */}
            <h1 className="x-pres-title" style={isThankYou ? { fontSize: "3.5rem", textAlign: "center" } : {}}>
              {language === "both" ? (
                <>
                  <DecodeText text={scene.titleEn} trigger={currentScene} />
                  <div style={{ fontSize: "0.8em", marginTop: 8, direction: "rtl", textAlign: "right" }}>
                    {scene.titleHe}
                  </div>
                </>
              ) : (
                <DecodeText text={title} trigger={currentScene} />
              )}
            </h1>

            {/* Description */}
            {!isThankYou && (
              <div className="x-pres-description">
                {language === "both" ? (
                  <>
                    <p>{scene.descriptionEn}</p>
                    <p style={{ direction: "rtl", textAlign: "right", marginTop: 12 }}>{scene.descriptionHe}</p>
                  </>
                ) : (
                  <p>{description}</p>
                )}
              </div>
            )}

            {/* Thank You subtitle */}
            {isThankYou && (
              <div style={{ textAlign: "center", color: "var(--x-pres-text-muted)", marginTop: 16 }}>
                {language === "both" ? (
                  <>
                    <p>{scene.descriptionEn}</p>
                    <p style={{ direction: "rtl", marginTop: 8 }}>{scene.descriptionHe}</p>
                  </>
                ) : (
                  <p>{description}</p>
                )}
              </div>
            )}

            {/* Data Line */}
            {scene.dataLine && !isThankYou && (
              <div className="x-pres-data-row">
                <span style={{ color: "var(--x-pres-text-muted)" }}>DATA</span>
                <span className="x-pres-data-val" style={{ color: scene.accentColor }}>
                  {scene.dataLine}
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene Counter (bottom left) */}
      <div style={{
        position: "absolute", bottom: 50, left: 50, zIndex: 80,
        fontFamily: "var(--x-pres-font-mono)", display: "flex", alignItems: "baseline", gap: 4,
      }}>
        <span style={{ fontSize: 32, fontWeight: 700, color: scene.accentColor, textShadow: `0 0 12px ${scene.accentColor}` }}>
          {String(currentScene + 1).padStart(2, "0")}
        </span>
        <span style={{ fontSize: 18, color: "#64748B" }}>/</span>
        <span style={{ fontSize: 14, color: "#64748B" }}>{String(scenes.length).padStart(2, "0")}</span>
      </div>

      {/* Progress bar top */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "rgba(255,255,255,0.05)", zIndex: 90 }}>
        <motion.div
          style={{ height: "100%", background: scene.accentColor, boxShadow: `0 0 8px ${scene.accentColor}`, borderRadius: "0 2px 2px 0" }}
          animate={{ width: `${((currentScene + 1) / scenes.length) * 100}%` }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </div>

      {/* Scroll hint on first scene */}
      {currentScene === 0 && scrollMode === "section" && (
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

      {/* Glitch overlay for cyber attack scene */}
      {scene.id === 5 && (
        <motion.div
          className="x-pres-glitch-overlay"
          style={{ display: "block" }}
          animate={{ opacity: [0, 0.15, 0, 0.1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
}
