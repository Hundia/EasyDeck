"use client";

import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { AnimatePresence, motion, useAnimation } from "framer-motion";
import "./styles.css";

/* ─── Scene Data ─────────────────────────────────────────────────── */

interface Scene {
  id: number;
  part: string;
  titleEn: string;
  titleHe: string;
  descriptionEn: string;
  descriptionHe: string;
  image: string;
  accentColor: string;
  hudLabel: string;
  dataLine?: string;
}

const scenes: Scene[] = [
  {
    id: 1,
    part: "PART 1 — THE THREAT",
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
  },
  {
    id: 2,
    part: "PART 2 — THE ALERT",
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
  },
  {
    id: 3,
    part: "PART 3 — INTELLIGENCE ANALYSIS",
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
  },
  {
    id: 4,
    part: "PART 4 — DEPLOYING ASSETS",
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
  },
  {
    id: 5,
    part: "PART 5 — CYBER DISRUPTION",
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
  },
  {
    id: 6,
    part: "PART 6 — CYBER DEFENSE",
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
  },
  {
    id: 7,
    part: "PART 7 — EYES ON TARGET",
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
  },
  {
    id: 8,
    part: "PART 8 — THE DECISION",
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
  },
  {
    id: 9,
    part: "PART 9 — CAPTURE",
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
  },
  {
    id: 10,
    part: "PART 10 — POST-OP ANALYSIS",
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
  },
  {
    id: 11,
    part: "PART 11 — INVESTIGATION RESULTS",
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
  },
  {
    id: 12,
    part: "PART 12 — OUR PHILOSOPHY",
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
  },
  {
    id: 13,
    part: "",
    titleEn: "THANK YOU",
    titleHe: "תודה",
    descriptionEn: "Intelligence Software Department",
    descriptionHe: "מחלקת תוכנה מודיעינית",
    image: "/presentations/x_pres/frames/frame-0013.webp",
    accentColor: "#00D4FF",
    hudLabel: "",
    dataLine: "SECURING THE FUTURE THROUGH INNOVATION",
  },
  {
    id: 14,
    part: "",
    titleEn: "",
    titleHe: "",
    descriptionEn: "",
    descriptionHe: "",
    image: "/presentations/x_pres/frames/frame-0014.webp",
    accentColor: "#00D4FF",
    hudLabel: "",
  },
];

/* ─── Typewriter Hook ─────────────────────────────────────────────── */

function useTypewriter(text: string, speed: number = 30, trigger: boolean = true) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!trigger) {
      setDisplayed("");
      setDone(false);
      return;
    }
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, trigger]);

  return { displayed, done };
}

/* ─── Animated Data Line ──────────────────────────────────────────── */

function DataLine({ text, color, delay = 0.8 }: { text: string; color: string; delay?: number }) {
  const { displayed } = useTypewriter(text, 20, true);

  return (
    <motion.div
      className="x-pres-data-line"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
      style={{ color }}
    >
      <span className="x-pres-data-cursor">▌</span>
      {displayed}
    </motion.div>
  );
}

/* ─── Animated Scan Line ──────────────────────────────────────────── */

function ScanLines() {
  return (
    <div className="x-pres-scanlines" aria-hidden="true">
      <div className="x-pres-scanline-sweep" />
    </div>
  );
}

/* ─── Particle Field ──────────────────────────────────────────────── */

function ParticleField({ color }: { color: string }) {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 1,
        duration: Math.random() * 8 + 4,
        delay: Math.random() * 4,
      })),
    []
  );

  return (
    <div className="x-pres-particles" aria-hidden="true">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="x-pres-particle"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: color,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            y: [0, -30, -60],
            scale: [0.5, 1, 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

/* ─── HUD Corner Brackets ─────────────────────────────────────────── */

function HUDCorners({ color }: { color: string }) {
  return (
    <>
      <motion.div
        className="x-pres-hud-corner x-pres-hud-tl"
        style={{ borderColor: `${color}66` }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />
      <motion.div
        className="x-pres-hud-corner x-pres-hud-tr"
        style={{ borderColor: `${color}66` }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      />
      <motion.div
        className="x-pres-hud-corner x-pres-hud-bl"
        style={{ borderColor: `${color}66` }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />
      <motion.div
        className="x-pres-hud-corner x-pres-hud-br"
        style={{ borderColor: `${color}66` }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      />
    </>
  );
}

/* ─── Glitch Text Effect ──────────────────────────────────────────── */

function GlitchText({ text, className }: { text: string; className?: string }) {
  return (
    <span className={`x-pres-glitch ${className || ""}`} data-text={text}>
      {text}
    </span>
  );
}

/* ─── Main Presentation Component ─────────────────────────────────── */

export default function XPresPage() {
  const [currentScene, setCurrentScene] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const lastScrollTime = useRef(0);
  const touchStartY = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Preload all images with progress
  useEffect(() => {
    let loaded = 0;
    const total = scenes.length;
    scenes.forEach((scene) => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        setLoadProgress(Math.round((loaded / total) * 100));
        if (loaded === total) setTimeout(() => setImagesLoaded(true), 500);
      };
      img.onerror = () => {
        loaded++;
        setLoadProgress(Math.round((loaded / total) * 100));
        if (loaded === total) setTimeout(() => setImagesLoaded(true), 500);
      };
      img.src = scene.image;
    });
  }, []);

  const navigate = useCallback(
    (direction: "next" | "prev") => {
      if (isTransitioning) return;
      const now = Date.now();
      if (now - lastScrollTime.current < 1000) return;
      lastScrollTime.current = now;

      setIsTransitioning(true);
      if (direction === "next" && currentScene < scenes.length - 1) {
        setCurrentScene((s) => s + 1);
      } else if (direction === "prev" && currentScene > 0) {
        setCurrentScene((s) => s - 1);
      }
      setTimeout(() => setIsTransitioning(false), 1000);
    },
    [currentScene, isTransitioning]
  );

  // Wheel
  useEffect(() => {
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      if (Math.abs(e.deltaY) > 30) {
        navigate(e.deltaY > 0 ? "next" : "prev");
      }
    };
    const el = containerRef.current;
    if (el) el.addEventListener("wheel", handler, { passive: false });
    return () => { if (el) el.removeEventListener("wheel", handler); };
  }, [navigate]);

  // Touch
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY;
    };
    const handleTouchEnd = (e: TouchEvent) => {
      const diff = touchStartY.current - e.changedTouches[0].clientY;
      if (Math.abs(diff) > 50) navigate(diff > 0 ? "next" : "prev");
    };
    const el = containerRef.current;
    if (el) {
      el.addEventListener("touchstart", handleTouchStart, { passive: true });
      el.addEventListener("touchend", handleTouchEnd, { passive: true });
    }
    return () => {
      if (el) {
        el.removeEventListener("touchstart", handleTouchStart);
        el.removeEventListener("touchend", handleTouchEnd);
      }
    };
  }, [navigate]);

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
  const isThankYou = currentScene >= 12;

  // Loading screen
  if (!imagesLoaded) {
    return (
      <div className="x-pres-loader">
        <div className="x-pres-loader-hud">
          <div className="x-pres-loader-ring" />
          <div className="x-pres-loader-text">
            <GlitchText text="LOADING OPERATIONAL BRIEFING" />
          </div>
          <div className="x-pres-loader-progress">
            <div
              className="x-pres-loader-bar"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <div className="x-pres-loader-percent">{loadProgress}%</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="x-pres-container">
      {/* Scan Lines Overlay */}
      <ScanLines />

      {/* Particle Field */}
      <ParticleField color={scene.accentColor} />

      {/* Background Image with Ken Burns */}
      <AnimatePresence mode="sync">
        <motion.div
          key={`bg-${currentScene}`}
          className="x-pres-bg"
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1.0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <motion.img
            src={scene.image}
            alt={scene.titleEn}
            className="x-pres-bg-img"
            animate={{ scale: [1, 1.05] }}
            transition={{ duration: 12, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          />
          <div className="x-pres-bg-overlay" />
          <div className="x-pres-vignette" />
        </motion.div>
      </AnimatePresence>

      {/* HUD Frame */}
      <div className="x-pres-hud">
        <HUDCorners color={scene.accentColor} />

        {/* HUD top label with glitch */}
        {scene.hudLabel && (
          <motion.div
            key={`hud-${currentScene}`}
            className="x-pres-hud-label"
            initial={{ opacity: 0, y: -20, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: 0.2, duration: 0.6 }}
            style={{ color: scene.accentColor }}
          >
            <GlitchText text={scene.hudLabel} />
          </motion.div>
        )}

        {/* Animated timeline bar at top */}
        <div className="x-pres-timeline-bar">
          <motion.div
            className="x-pres-timeline-fill"
            animate={{ width: `${((currentScene + 1) / scenes.length) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{ backgroundColor: scene.accentColor }}
          />
        </div>

        {/* Scene counter */}
        <motion.div
          key={`counter-${currentScene}`}
          className="x-pres-scene-counter"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="x-pres-scene-current" style={{ color: scene.accentColor }}>
            {String(currentScene + 1).padStart(2, "0")}
          </span>
          <span className="x-pres-scene-sep">/</span>
          <span className="x-pres-scene-total">{String(scenes.length).padStart(2, "0")}</span>
        </motion.div>

        {/* Progress dots - right side */}
        <div className="x-pres-progress">
          {scenes.map((s, i) => (
            <motion.div
              key={i}
              className={`x-pres-dot ${i === currentScene ? "active" : ""} ${i < currentScene ? "passed" : ""}`}
              style={
                i === currentScene
                  ? { backgroundColor: scene.accentColor, boxShadow: `0 0 12px ${scene.accentColor}` }
                  : i < currentScene
                  ? { backgroundColor: `${scene.accentColor}44` }
                  : {}
              }
              whileHover={{ scale: 1.5 }}
              onClick={() => {
                if (!isTransitioning) {
                  setIsTransitioning(true);
                  setCurrentScene(i);
                  setTimeout(() => setIsTransitioning(false), 1000);
                }
              }}
            />
          ))}
        </div>

        {/* Data line (bottom right) */}
        {scene.dataLine && (
          <motion.div
            key={`data-${currentScene}`}
            className="x-pres-data-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
          >
            <DataLine text={scene.dataLine} color={scene.accentColor} delay={1.2} />
          </motion.div>
        )}
      </div>

      {/* Content Panel */}
      <AnimatePresence mode="wait">
        {scene.titleEn && (
          <motion.div
            key={`content-${currentScene}`}
            className={`x-pres-content ${isThankYou ? "x-pres-content-center" : ""}`}
            initial={{ opacity: 0, x: -60, filter: "blur(8px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, x: 60, filter: "blur(8px)" }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="x-pres-glass-panel" style={{ borderColor: `${scene.accentColor}33` }}>
              {/* Animated border glow */}
              <div
                className="x-pres-panel-glow"
                style={{ background: `linear-gradient(135deg, ${scene.accentColor}22, transparent)` }}
              />

              {/* Part label */}
              {scene.part && (
                <motion.div
                  className="x-pres-part"
                  style={{ color: scene.accentColor }}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  {scene.part}
                </motion.div>
              )}

              {/* English title — staggered letters */}
              <motion.h1
                className={`x-pres-title-en ${isThankYou ? "x-pres-title-large" : ""}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                {scene.titleEn}
              </motion.h1>

              {/* Hebrew title (RTL) */}
              <motion.h2
                className={`x-pres-title-he ${isThankYou ? "x-pres-title-he-large" : ""}`}
                dir="rtl"
                lang="he"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                {scene.titleHe}
              </motion.h2>

              {/* Animated separator */}
              <motion.div
                className="x-pres-separator"
                style={{ backgroundColor: scene.accentColor }}
                initial={{ width: 0 }}
                animate={{ width: 80 }}
                transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
              />

              {/* English description */}
              {scene.descriptionEn && !isThankYou && (
                <motion.p
                  className="x-pres-desc-en"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                >
                  {scene.descriptionEn}
                </motion.p>
              )}

              {/* Hebrew description (RTL) */}
              {scene.descriptionHe && !isThankYou && (
                <motion.p
                  className="x-pres-desc-he"
                  dir="rtl"
                  lang="he"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 0.5 }}
                >
                  {scene.descriptionHe}
                </motion.p>
              )}

              {/* Thank you subtitle */}
              {isThankYou && scene.descriptionEn && (
                <motion.p
                  className="x-pres-subtitle-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                >
                  {scene.descriptionEn}
                </motion.p>
              )}
              {isThankYou && scene.descriptionHe && (
                <motion.p
                  className="x-pres-subtitle-center-he"
                  dir="rtl"
                  lang="he"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.4, duration: 0.8 }}
                >
                  {scene.descriptionHe}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scroll hint - first scene only */}
      {currentScene === 0 && (
        <motion.div
          className="x-pres-scroll-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3, duration: 1.5 }}
        >
          <motion.div
            className="x-pres-scroll-arrow"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <span>SCROLL TO PROCEED</span>
        </motion.div>
      )}

      {/* Ambient sound wave visualization (decorative) */}
      <div className="x-pres-ambient-waves" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            className="x-pres-wave-bar"
            animate={{ scaleY: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.5 + i * 0.2,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut",
            }}
            style={{ backgroundColor: `${scene.accentColor}44` }}
          />
        ))}
      </div>
    </div>
  );
}
