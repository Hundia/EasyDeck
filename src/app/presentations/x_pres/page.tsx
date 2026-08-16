"use client";

import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import { Observer } from "gsap/Observer";

import VideoBackground from "./VideoBackground";
import {
  EditToolbar,
  PanelOverride,
  PanelOverrides,
  TextBoxes,
  ExtraTextBox,
  loadOverrides,
  saveOverrides,
  loadTextBoxes,
  saveTextBoxes,
  FONTS_EN,
  FONTS_HE,
} from "./EditToolbar";
import SlidePanels, { SlideLayout } from "./SlidePanels";
import "./styles.css";

/* ─── Types ───────────────────────────────────────────────────────── */

type ScrollMode = "gsap" | "continuous" | "autoplay";
type Language = "both" | "en" | "he";
type MediaMode = "image" | "video";
type TextMode = "full" | "header" | "none";
type TransitionVersion = "A" | "B" | "C";
type OpenerStage = "first-loop" | "playing-main" | "repeat-loop" | "done";

interface Scene {
  id: number;
  part: string;
  partHe: string;
  titleEn: string;
  titleHe: string;
  bulletsEn: string[];
  bulletsHe: string[];
  image: string;
  video?: string;
  accentColor: string;
  hudLabel: string;
  hudLabelHe: string;
  dataLine?: string;
  layout: SlideLayout;
  panelPosition: "bottom-center";
}

import slidesData from "./slides.json";

const ACCENT_COLORS = [
  "#00D4FF",
  "#3D7BFF",
  "#FF2E3B",
  "#FFB830",
  "#00E676",
  "#A855F7",
  "#FFB830",
  "#00D4FF",
  "#00E676",
  "#FF2E3B",
  "#3D7BFF",
  "#00D4FF",
];

const OPENER_VIDEOS = {
  firstLoop: "/presentations/hativa/videos/opener/opener_first_loop.mp4",
  main: "/presentations/hativa/videos/opener/Opener.mp4",
  repeatLoop: "/presentations/hativa/videos/opener/opener_repeat.mp4",
};

function resolveAsset(filename: string, folder: "frames" | "videos"): string {
  if (!filename) return "";
  const cleanName = filename.replace(/^\d+_/, "");
  return `/presentations/hativa/${folder}/${cleanName}`;
}

const scenes: Scene[] = slidesData.slides.map((s, idx) => ({
  id: idx,
  part: s.en.act.toUpperCase(),
  partHe: s.he.act,
  titleEn: s.en.title,
  titleHe: s.he.title,
  bulletsEn: s.en.bullets,
  bulletsHe: s.he.bullets,
  image: resolveAsset(s.image, "frames"),
  video: resolveAsset(s.video, "videos"),
  accentColor: ACCENT_COLORS[idx % ACCENT_COLORS.length],
  hudLabel: s.en.footer,
  hudLabelHe: s.he.footer,
  dataLine: `DIORAMA: ${s.diorama} | PROVENANCE: ${s.provenance ? s.provenance.join(", ").toUpperCase() : "RESEARCH"}`,
  layout: (s as { layout: SlideLayout }).layout,
  panelPosition: "bottom-center",
}));

/* ─── Lazy Transitions ────────────────────────────────────────────── */

const DeadDropTransition = lazy(() => import("./transitions/DeadDropTransition"));
const OrbitalTransition = lazy(() => import("./transitions/OrbitalTransition"));
const ConsensusTransition = lazy(() => import("./transitions/ConsensusTransition"));

/* ─── Active transition state ─────────────────────────────────────── */

interface ActiveTransition {
  fromIndex: number;
  toIndex: number;
  direction: 1 | -1;
  key: number;
}

/* ─── Main Hativa Page Component ─────────────────────────────────── */

export default function HativaPresPage() {
  const STORAGE_PREFIX = "hativa-pres";
  const [openerStage, setOpenerStage] = useState<OpenerStage>("first-loop");
  const [currentScene, setCurrentScene] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadProgress, setLoadProgress] = useState(0);
  const [scrollMode, setScrollMode] = useState<ScrollMode>("gsap");
  const [language, setLanguage] = useState<Language>("both");
  const [prevImage, setPrevImage] = useState<string>("");
  const [prevVideo, setPrevVideo] = useState<string>("");
  const [prevVisible, setPrevVisible] = useState(false);
  const [autoplayProgress, setAutoplayProgress] = useState(0);
  const [mediaMode, setMediaMode] = useState<MediaMode>("video");
  const [transitionVersion, setTransitionVersion] = useState<TransitionVersion>("A");
  const [activeTransition, setActiveTransition] = useState<ActiveTransition | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [panelSize, setPanelSize] = useState<"lg" | "md" | "sm">("lg");
  const [textMode, setTextMode] = useState<TextMode>("none");
  const [panelOverrides, setPanelOverrides] = useState<PanelOverrides>({});
  const [textBoxes, setTextBoxes] = useState<TextBoxes>({});
  const [selectedTextBox, setSelectedTextBox] = useState<string | null>(null);
  const transitionKeyRef = useRef(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevBgRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const videoBgRef = useRef<any>(null);
  const openerVideoRef = useRef<HTMLVideoElement>(null);
  const isTransitioningRef = useRef(false);
  const currentSceneRef = useRef(0);
  const openerStageRef = useRef<OpenerStage>("first-loop");
  const gsapObserverRef = useRef<ReturnType<typeof Observer.create> | null>(null);
  // Browsers block unmuted autoplay before any user gesture; once the user
  // has interacted once, this stays true and every later video (including
  // a re-shown loop) is free to play with sound.
  const hasInteractedRef = useRef(false);

  // Sync openerStageRef
  useEffect(() => {
    openerStageRef.current = openerStage;
  }, [openerStage]);

  // Language persistence
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(`${STORAGE_PREFIX}-lang`) : null;
    if (saved === "en" || saved === "he" || saved === "both") setLanguage(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(`${STORAGE_PREFIX}-lang`, language);
  }, [language]);

  // Text-mode persistence (defaults to "none")
  useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem(`${STORAGE_PREFIX}-textmode`) : null;
    if (saved === "full" || saved === "header" || saved === "none") setTextMode(saved);
  }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(`${STORAGE_PREFIX}-textmode`, textMode);
  }, [textMode]);

  // Overrides persistence
  useEffect(() => {
    setPanelOverrides(loadOverrides(STORAGE_PREFIX));
  }, []);

  const updatePanelOverride = useCallback((sceneIdx: number, patch: Partial<PanelOverride>) => {
    setPanelOverrides((prev) => {
      const updated = { ...prev, [sceneIdx]: { ...(prev[sceneIdx] || {}), ...patch } };
      saveOverrides(updated, STORAGE_PREFIX);
      return updated;
    });
  }, []);

  const handlePositionPreset = useCallback(
    (position: string) => {
      updatePanelOverride(currentScene, { x: undefined, y: undefined });
      setPanelOverrides((prev) => {
        const updated = {
          ...prev,
          [currentScene]: {
            ...(prev[currentScene] || {}),
            x: undefined,
            y: undefined,
            position,
          } as PanelOverride & { position?: string },
        };
        saveOverrides(updated, STORAGE_PREFIX);
        return updated;
      });
    },
    [currentScene, updatePanelOverride]
  );

  // Text boxes persistence
  useEffect(() => {
    setTextBoxes(loadTextBoxes(STORAGE_PREFIX));
  }, []);

  const handleAddTextBox = useCallback(() => {
    const newBox: ExtraTextBox = {
      id: `tb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: "New text note",
      x: 100,
      y: 100,
      width: 280,
      border: true,
      fontFamily: "'Inter', sans-serif",
      fontSize: 18,
    };
    setTextBoxes((prev) => {
      const sceneBoxes = [...(prev[currentScene] || []), newBox];
      const updated = { ...prev, [currentScene]: sceneBoxes };
      saveTextBoxes(updated, STORAGE_PREFIX);
      return updated;
    });
    setSelectedTextBox(newBox.id);
  }, [currentScene]);

  const handleUpdateTextBox = useCallback(
    (boxId: string, patch: Partial<ExtraTextBox>) => {
      setTextBoxes((prev) => {
        const sceneBoxes = (prev[currentScene] || []).map((b) =>
          b.id === boxId ? { ...b, ...patch } : b
        );
        const updated = { ...prev, [currentScene]: sceneBoxes };
        saveTextBoxes(updated, STORAGE_PREFIX);
        return updated;
      });
    },
    [currentScene]
  );

  const handleDeleteTextBox = useCallback(
    (boxId: string) => {
      setTextBoxes((prev) => {
        const sceneBoxes = (prev[currentScene] || []).filter((b) => b.id !== boxId);
        const updated = { ...prev, [currentScene]: sceneBoxes };
        saveTextBoxes(updated, STORAGE_PREFIX);
        return updated;
      });
      if (selectedTextBox === boxId) setSelectedTextBox(null);
    },
    [currentScene, selectedTextBox]
  );

  // Preload images / videos ready check
  useEffect(() => {
    let loaded = 0;
    const total = scenes.length;
    const markDone = () => {
      loaded++;
      setLoadProgress(Math.round((loaded / total) * 100));
      if (loaded === total) setTimeout(() => setImagesLoaded(true), 300);
    };
    scenes.forEach((scene) => {
      const img = new Image();
      img.onload = markDone;
      img.onerror = markDone;
      img.src = scene.image;
    });
    const fallback = setTimeout(() => {
      setImagesLoaded(true);
    }, 3000);
    return () => clearTimeout(fallback);
  }, []);

  // Sync currentSceneRef
  useEffect(() => {
    currentSceneRef.current = currentScene;
  }, [currentScene]);

  // Opener video source control & seamless playback
  useEffect(() => {
    const v = openerVideoRef.current;
    if (!v) return;

    // Muted until the user's first gesture — required for autoplay before
    // that point. Once they've interacted, every video (including a
    // re-shown loop) plays with sound.
    v.muted = !hasInteractedRef.current;

    if (openerStage === "first-loop") {
      v.volume = 0.5;
      v.src = OPENER_VIDEOS.firstLoop;
      v.loop = true;
      v.load();
      v.play().catch(() => {});
    } else if (openerStage === "playing-main") {
      v.volume = 1;
      v.src = OPENER_VIDEOS.main;
      v.loop = false;
      v.load();
      v.play().catch(() => {});
    } else if (openerStage === "repeat-loop") {
      v.volume = 1;
      v.src = OPENER_VIDEOS.repeatLoop;
      v.loop = true;
      v.load();
      v.play().catch(() => {});
    }
  }, [openerStage]);

  // Keep the opener video alive across tab/window focus changes — some
  // browsers pause background video after a while and nothing else would
  // resume it, so it looks "stuck" when you tab back in.
  useEffect(() => {
    const resume = () => {
      const v = openerVideoRef.current;
      if (v && openerStageRef.current !== "done" && v.paused) {
        v.play().catch(() => {});
      }
    };
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("focus", resume);
    return () => {
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("focus", resume);
    };
  }, []);

  // Handler for Opener.mp4 ending
  const handleMainOpenerEnded = useCallback(() => {
    if (openerStageRef.current === "playing-main") {
      setOpenerStage("repeat-loop");
    }
  }, []);

  // Robust panel animation whenever currentScene or textMode changes
  useEffect(() => {
    const el = panelRef.current;
    if (el && textMode !== "none") {
      gsap.killTweensOf(el);
      gsap.fromTo(
        el,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }
      );
    }
  }, [currentScene, textMode]);

  /* ─── Image Transition ────────────────────────────────────────── */

  const doImageTransition = useCallback((nextIndex: number, dir: number) => {
    if (isTransitioningRef.current) return;
    if (nextIndex < 0 || nextIndex >= scenes.length) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);

    const panelEl = panelRef.current;
    if (panelEl) {
      gsap.killTweensOf(panelEl);
      gsap.to(panelEl, { opacity: 0, y: dir * -16, duration: 0.18, ease: "power2.in" });
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
                opacity: 0,
                y: dir * -110,
                scale: 0.94,
                duration: 0.7,
                ease: "power3.inOut",
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
        });
      });
    }, 180);
  }, []);

  /* ─── Video Transition ────────────────────────────────────────── */

  const handleVideoSwitch = useCallback(() => {
    const next = activeTransition?.toIndex ?? currentSceneRef.current;
    setCurrentScene(next);
    currentSceneRef.current = next;
    setPrevVisible(false);
  }, [activeTransition]);

  const handleTransitionComplete = useCallback(() => {
    setActiveTransition(null);
    isTransitioningRef.current = false;
    setIsTransitioning(false);
    setPrevVisible(false);
  }, []);

  const doVideoTransition = useCallback((nextIndex: number, dir: number) => {
    if (isTransitioningRef.current) return;
    if (nextIndex < 0 || nextIndex >= scenes.length) return;
    isTransitioningRef.current = true;
    setIsTransitioning(true);

    const prevSrc = scenes[currentSceneRef.current].video || scenes[currentSceneRef.current].image;
    setPrevVideo(prevSrc);
    setPrevVisible(true);

    const panelEl = panelRef.current;
    if (panelEl) {
      gsap.killTweensOf(panelEl);
      gsap.to(panelEl, { opacity: 0, y: dir * -16, duration: 0.18, ease: "power2.in" });
    }

    transitionKeyRef.current += 1;
    setActiveTransition({
      fromIndex: currentSceneRef.current,
      toIndex: nextIndex,
      direction: dir as 1 | -1,
      key: transitionKeyRef.current,
    });

    // Defensive fallback timeout so transition state never locks up
    setTimeout(() => {
      if (isTransitioningRef.current) {
        handleVideoSwitch();
        handleTransitionComplete();
      }
    }, 1300);
  }, [handleVideoSwitch, handleTransitionComplete]);

  const doGsapTransition = useCallback(
    (nextIndex: number, dir: number) => {
      if (openerStageRef.current !== "done") {
        setOpenerStage("done");
        setCurrentScene(nextIndex);
        currentSceneRef.current = nextIndex;
        return;
      }

      const fromScene = scenes[currentSceneRef.current];
      const toScene = scenes[nextIndex];
      if (mediaMode === "video" && fromScene.video && toScene.video) {
        doVideoTransition(nextIndex, dir);
      } else {
        doImageTransition(nextIndex, dir);
      }
    },
    [mediaMode, doVideoTransition, doImageTransition]
  );

  // Advance opener sequence on click or action
  const handleOpenerAdvance = useCallback(() => {
    hasInteractedRef.current = true;
    const stage = openerStageRef.current;
    if (stage === "first-loop") {
      setOpenerStage("playing-main");
    } else if (stage === "playing-main") {
      setOpenerStage("repeat-loop");
    } else if (stage === "repeat-loop") {
      setOpenerStage("done");
      setCurrentScene(0);
      currentSceneRef.current = 0;
    }
  }, []);

  // Autoplay handler
  useEffect(() => {
    if (scrollMode === "autoplay" && openerStage === "done") {
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
  }, [scrollMode, openerStage, doGsapTransition]);

  // Register GSAP Observer
  useEffect(() => {
    gsap.registerPlugin(Observer);
    if (scrollMode !== "gsap") {
      gsapObserverRef.current?.kill();
      gsapObserverRef.current = null;
      return;
    }
    document.body.style.overflow = "hidden";

    gsapObserverRef.current = Observer.create({
      type: "wheel,touch,pointer",
      onDown: () => {
        if (openerStageRef.current !== "done") {
          handleOpenerAdvance();
        } else {
          const curr = currentSceneRef.current;
          if (curr < scenes.length - 1) doGsapTransition(curr + 1, 1);
        }
      },
      onUp: () => {
        if (openerStageRef.current !== "done") {
          if (openerStageRef.current === "repeat-loop") setOpenerStage("first-loop");
        } else {
          const curr = currentSceneRef.current;
          if (curr > 0) {
            doGsapTransition(curr - 1, -1);
          } else {
            setOpenerStage("repeat-loop");
          }
        }
      },
      wheelSpeed: -1,
      tolerance: 10,
      preventDefault: true,
    });

    return () => {
      gsapObserverRef.current?.kill();
      gsapObserverRef.current = null;
      document.body.style.overflow = "";
    };
  }, [scrollMode, handleOpenerAdvance, doGsapTransition]);

  // Keyboard & Mouse Click Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "ArrowDown" ||
        e.key === "PageDown" ||
        e.key === " " ||
        e.key === "Enter" ||
        e.key === "ArrowRight"
      ) {
        e.preventDefault();
        if (openerStageRef.current !== "done") {
          handleOpenerAdvance();
        } else {
          const curr = currentSceneRef.current;
          if (curr < scenes.length - 1) doGsapTransition(curr + 1, 1);
        }
      } else if (
        e.key === "ArrowUp" ||
        e.key === "PageUp" ||
        e.key === "ArrowLeft"
      ) {
        e.preventDefault();
        if (openerStageRef.current !== "done") {
          if (openerStageRef.current === "repeat-loop") setOpenerStage("first-loop");
        } else {
          const curr = currentSceneRef.current;
          if (curr > 0) {
            doGsapTransition(curr - 1, -1);
          } else {
            setOpenerStage("repeat-loop");
          }
        }
      }
    };

    const handleMouseClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(
          "button, input, select, textarea, .x-pres-toolbar, .x-pres-toolbar-pill, .x-pres-hud-signal, .x-pres-top-menu, .x-pres-edit-panel, .x-pres-edit-toolbar, .x-pres-controls-wrapper, .x-pres-menu-dot, .x-pres-nav-dot, .x-pres-content, .hp-card, a"
        )
      ) {
        return;
      }

      if (openerStageRef.current !== "done") {
        handleOpenerAdvance();
      } else {
        const curr = currentSceneRef.current;
        if (curr < scenes.length - 1) {
          doGsapTransition(curr + 1, 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("click", handleMouseClick);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("click", handleMouseClick);
    };
  }, [handleOpenerAdvance, doGsapTransition]);

  const scene = scenes[currentScene];
  const override = panelOverrides[currentScene] || {};

  return (
    <main
      ref={containerRef}
      className={`x-pres-container mode-${scrollMode}`}
      style={{
        "--x-pres-accent": scene.accentColor,
      } as React.CSSProperties}
    >
      {/* Loading Overlay */}
      {!imagesLoaded && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 999,
            background: "#0D1117",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "1.5rem",
          }}
        >
          <div style={{ fontFamily: "JetBrains Mono, monospace", color: scene.accentColor, fontSize: "14px", letterSpacing: "0.2em" }}>
            INITIALIZING HATIVA BRIEFING... {loadProgress}%
          </div>
          <div style={{ width: "200px", height: "2px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
            <div style={{ width: `${loadProgress}%`, height: "100%", background: scene.accentColor, transition: "width 0.2s" }} />
          </div>
        </div>
      )}

      {/* Main Background Video / Image Layer */}
      {openerStage !== "done" ? (
        <>
          <video
            ref={openerVideoRef}
            className="x-pres-video-bg"
            autoPlay
            muted
            playsInline
            onEnded={handleMainOpenerEnded}
            onPause={() => {
              const v = openerVideoRef.current;
              if (v && openerStageRef.current !== "done") v.play().catch(() => {});
            }}
            style={{
              position: "absolute",
              inset: 0,
              width: "100vw",
              height: "100vh",
              objectFit: "fill",
              objectPosition: "center center",
              zIndex: 1,
            }}
          />
          {/* Preload repeater for fast 0ms transition */}
          <video
            src={OPENER_VIDEOS.repeatLoop}
            preload="auto"
            style={{ display: "none" }}
          />
        </>
      ) : mediaMode === "video" && scene.video ? (
        <VideoBackground
          ref={videoBgRef}
          currentSrc={scene.video}
          prevSrc={prevVideo}
          prevVisible={prevVisible}
          muted={false}
        />
      ) : (
        <>
          <div
            className="x-pres-frame-bg"
            style={{ backgroundImage: `url("${scene.image}")` }}
          />
          {prevVisible && (
            <div
              ref={prevBgRef}
              className="x-pres-frame-bg"
              style={{ backgroundImage: `url("${prevImage}")`, zIndex: 2 }}
            />
          )}
        </>
      )}

      <div className="x-pres-frame-overlay" />
      <div className="x-pres-scanlines" />

      {/* Top Left Brand Logo — hovers above all scenes with transparency preserved */}
      <div
        className="x-pres-brand-logo-wrapper"
        style={{
          position: "fixed",
          top: "24px",
          left: "68px",
          zIndex: 100,
          pointerEvents: "none",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          filter: "drop-shadow(0 2px 12px rgba(0, 0, 0, 0.6))",
        }}
      >
        <img
          src="/presentations/hativa/logo.png"
          alt="Hativa Logo"
          style={{
            width: "clamp(193px, 25.4vh, 314px)",
            height: "auto",
            objectFit: "contain",
          }}
        />
      </div>

      {/* Top Right Brand Logo — hovers above all scenes with transparency preserved */}
      <div
        className="x-pres-brand-logo-right-wrapper"
        style={{
          position: "fixed",
          top: "24px",
          right: "68px",
          zIndex: 100,
          pointerEvents: "none",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          filter: "drop-shadow(0 2px 12px rgba(0, 0, 0, 0.6))",
        }}
      >
        <img
          src="/presentations/hativa/logo_right.png"
          alt="Hativa Right Logo"
          style={{
            width: "clamp(193px, 25.4vh, 314px)",
            height: "auto",
            objectFit: "contain",
          }}
        />
      </div>

      {/* HUD Frame Elements */}
      <div className="x-pres-hud">
        <div className="x-pres-hud-bracket x-pres-hud-tl" />
        <div className="x-pres-hud-bracket x-pres-hud-tr" />
        <div className="x-pres-hud-bracket x-pres-hud-bl" />
        <div className="x-pres-hud-bracket x-pres-hud-br" />
      </div>

      {/* Slide Navigation Dots */}
      <div className="x-pres-nav">
        {/* Opener Dot */}
        <button
          className={`x-pres-nav-dot ${openerStage !== "done" ? "active" : ""}`}
          onClick={() => setOpenerStage("first-loop")}
          title="Opener Video"
          style={{
            borderColor: openerStage !== "done" ? "#00D4FF" : undefined,
          }}
        />
        {/* 12 Presentation Slide Dots */}
        {scenes.map((s, idx) => (
          <button
            key={s.id}
            className={`x-pres-nav-dot ${openerStage === "done" && idx === currentScene ? "active" : ""}`}
            onClick={() => {
              setOpenerStage("done");
              doGsapTransition(idx, idx > currentScene ? 1 : -1);
            }}
            title={`Slide ${idx + 1}: ${s.titleEn}`}
          />
        ))}
      </div>

      {/* Floating Control Menu Button & Pills */}
      <button
        className="x-pres-menu-dot"
        style={{
          background: menuOpen ? scene.accentColor : "rgba(13, 17, 23, 0.8)",
          boxShadow: `0 0 12px ${scene.accentColor}`,
        }}
        onClick={() => setMenuOpen(!menuOpen)}
        title="Toggle Controls Menu"
      >
        {menuOpen ? "✕" : "⚙"}
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="x-pres-controls-wrapper"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {/* Scroll Mode Pill */}
            <div className="x-pres-control-pill">
              {(["gsap", "continuous", "autoplay"] as const).map((mode) => (
                <button
                  key={mode}
                  className={`x-pres-control-btn ${scrollMode === mode ? "active" : ""}`}
                  style={scrollMode === mode ? { background: scene.accentColor } : {}}
                  onClick={() => setScrollMode(mode)}
                  data-tooltip={`Mode: ${mode}`}
                >
                  {mode === "gsap" ? "⬤" : mode === "continuous" ? "≡" : "▶"}
                  {mode === "autoplay" && scrollMode === "autoplay" && (
                    <svg className="x-pres-autoplay-ring" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" style={{ strokeDashoffset: 100 - autoplayProgress }} />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            {/* Language Toggle Pill */}
            <div className="x-pres-control-pill">
              {(["both", "en", "he"] as const).map((lang) => (
                <button
                  key={lang}
                  className={`x-pres-control-btn ${language === lang ? "active" : ""}`}
                  style={language === lang ? { background: scene.accentColor } : {}}
                  onClick={() => setLanguage(lang)}
                  data-tooltip={`Lang: ${lang.toUpperCase()}`}
                >
                  {lang === "both" ? "🌐" : lang.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Media Mode Pill */}
            <div className="x-pres-control-pill">
              {(["image", "video"] as const).map((m) => (
                <button
                  key={m}
                  className={`x-pres-control-btn ${mediaMode === m ? "active" : ""}`}
                  style={mediaMode === m ? { background: scene.accentColor } : {}}
                  onClick={() => setMediaMode(m)}
                  data-tooltip={`Media: ${m}`}
                >
                  {m === "image" ? "🖼" : "🎬"}
                </button>
              ))}
            </div>

            {/* Text Display Mode Pill — full text / headers only / nothing */}
            <div className="x-pres-control-pill">
              {([
                { mode: "full", glyph: "\u2261", tip: "Text: full" },
                { mode: "header", glyph: "T", tip: "Text: headers only" },
                { mode: "none", glyph: "\u2205", tip: "Text: hidden" },
              ] as const).map(({ mode, glyph, tip }) => (
                <button
                  key={mode}
                  className={`x-pres-control-btn ${textMode === mode ? "active" : ""}`}
                  style={textMode === mode ? { background: scene.accentColor } : {}}
                  onClick={() => setTextMode(mode)}
                  data-tooltip={tip}
                >
                  {glyph}
                </button>
              ))}
            </div>

            {/* Panel Size Pill */}
            <div className="x-pres-control-pill">
              {(["lg", "md", "sm"] as const).map((sz) => (
                <button
                  key={sz}
                  className={`x-pres-control-btn ${panelSize === sz ? "active" : ""}`}
                  style={panelSize === sz ? { background: scene.accentColor } : {}}
                  onClick={() => setPanelSize(sz)}
                  data-tooltip={`Size: ${sz.toUpperCase()}`}
                >
                  {sz.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Edit Mode Toggle Pill */}
            <div className="x-pres-control-pill">
              <button
                className={`x-pres-control-btn ${editMode ? "active" : ""}`}
                style={editMode ? { background: scene.accentColor } : {}}
                onClick={() => setEditMode(!editMode)}
                data-tooltip="Toggle Layout Edit Mode"
              >
                ✎
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Slide text — bespoke per-slide placement, see SlidePanels.tsx */}
      {openerStage === "done" && textMode !== "none" && (
        <SlidePanels
          ref={panelRef}
          scene={scene}
          language={language}
          mode={textMode}
          sizeScale={panelSize === "md" ? 0.85 : panelSize === "sm" ? 0.7 : 1}
          fontEn={override.fontEn || FONTS_EN[0].family}
          fontHe={override.fontHe || FONTS_HE[0].family}
          offsetX={override.x}
          offsetY={override.y}
          widthPx={override.width}
          showBorder={override.border !== false}
        />
      )}

      {/* Edit Mode Toolbar */}
      {editMode && (
        <EditToolbar
          sceneIndex={currentScene}
          overrides={panelOverrides}
          onUpdate={updatePanelOverride}
          accentColor={scene.accentColor}
          onPositionPreset={handlePositionPreset}
          textBoxes={textBoxes[currentScene] || []}
          onAddTextBox={handleAddTextBox}
          onUpdateTextBox={handleUpdateTextBox}
          onDeleteTextBox={handleDeleteTextBox}
          selectedTextBox={selectedTextBox}
          onSelectTextBox={setSelectedTextBox}
        />
      )}

      {/* Active Transition Overlay */}
      {activeTransition && (
        <Suspense fallback={null}>
          {transitionVersion === "A" && (
            <DeadDropTransition
              key={activeTransition.key}
              fromScene={scenes[activeTransition.fromIndex]}
              toScene={scenes[activeTransition.toIndex]}
              direction={activeTransition.direction}
              prevVideoRef={{ current: videoBgRef.current?.prevVideoEl ?? null }}
              currentVideoRef={{ current: videoBgRef.current?.currentVideoEl ?? null }}
              onVideoSwitch={handleVideoSwitch}
              onComplete={handleTransitionComplete}
            />
          )}
          {transitionVersion === "B" && (
            <OrbitalTransition
              key={activeTransition.key}
              fromScene={scenes[activeTransition.fromIndex]}
              toScene={scenes[activeTransition.toIndex]}
              direction={activeTransition.direction}
              prevVideoRef={{ current: videoBgRef.current?.prevVideoEl ?? null }}
              currentVideoRef={{ current: videoBgRef.current?.currentVideoEl ?? null }}
              onVideoSwitch={handleVideoSwitch}
              onComplete={handleTransitionComplete}
            />
          )}
          {transitionVersion === "C" && (
            <ConsensusTransition
              key={activeTransition.key}
              fromScene={scenes[activeTransition.fromIndex]}
              toScene={scenes[activeTransition.toIndex]}
              direction={activeTransition.direction}
              prevVideoRef={{ current: videoBgRef.current?.prevVideoEl ?? null }}
              currentVideoRef={{ current: videoBgRef.current?.currentVideoEl ?? null }}
              onVideoSwitch={handleVideoSwitch}
              onComplete={handleTransitionComplete}
            />
          )}
        </Suspense>
      )}
    </main>
  );
}
