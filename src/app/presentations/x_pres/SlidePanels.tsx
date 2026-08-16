"use client";

import React, { forwardRef } from "react";
import "./panels.css";

/* ─── Layout geometry (viewport fractions, authored in slides.json) ── */

export interface BoxRect {
  x: number;
  w: number;
  top?: number;
  bottom?: number;
  maxH?: number;
}

export type SlideLayout =
  | { kind: "band"; header: BoxRect; body: BoxRect }
  | { kind: "sides"; en: BoxRect; he: BoxRect };

export interface PanelScene {
  part: string;
  partHe: string;
  titleEn: string;
  titleHe: string;
  bulletsEn: string[];
  bulletsHe: string[];
  hudLabel: string;
  hudLabelHe: string;
  dataLine?: string;
  layout: SlideLayout;
}

export type PanelLanguage = "both" | "en" | "he";

/**
 * "full"   — titles and bullets are permanently on screen.
 * "header" — only the titles show; hovering a card unfurls its bullets in place.
 */
export type PanelMode = "full" | "header";

interface SlidePanelsProps {
  scene: PanelScene;
  language: PanelLanguage;
  mode: PanelMode;
  /** Panel scale from the LG/MD/SM control. */
  sizeScale: number;
  fontEn: string;
  fontHe: string;
  /** Edit-mode overrides. `x`/`y` reposition the primary (header / English) card. */
  offsetX?: number;
  offsetY?: number;
  widthPx?: number;
  showBorder?: boolean;
}

/* ─── Helpers ─────────────────────────────────────────────────────── */

const vw = (n: number) => `${n * 100}vw`;
const vh = (n: number) => `${n * 100}vh`;

function rectStyle(rect: BoxRect, scale: number, applyMaxH = true): React.CSSProperties {
  const style: React.CSSProperties = {
    left: vw(rect.x),
    width: vw(rect.w),
  };
  if (rect.top !== undefined) style.top = vh(rect.top);
  if (rect.bottom !== undefined) style.bottom = vh(rect.bottom);
  if (applyMaxH && rect.maxH !== undefined) {
    style.maxHeight = vh(rect.maxH);
    style.overflowY = "auto";
  }
  if (scale !== 1) {
    style.transform = `scale(${scale})`;
    style.transformOrigin = rect.bottom !== undefined ? "bottom left" : "top left";
  }
  return style;
}

function Bullets({ items, lang }: { items: string[]; lang: "en" | "he" }) {
  return (
    <ul className="hp-bullets">
      {items.map((b, i) => (
        <li key={i}>
          <span className="hp-marker">{lang === "he" ? "◂" : "▸"}</span>
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Collapsed-by-default wrapper. The 0fr→1fr grid row animates to the content's
 * natural height, which `max-height` alone cannot do without a magic number.
 */
function Expandable({ children }: { children: React.ReactNode }) {
  return (
    <div className="hp-expandable">
      <div className="hp-expandable-inner">{children}</div>
    </div>
  );
}

/* ─── Component ───────────────────────────────────────────────────── */

const SlidePanels = forwardRef<HTMLDivElement, SlidePanelsProps>(function SlidePanels(
  { scene, language, mode, sizeScale, fontEn, fontHe, offsetX, offsetY, widthPx, showBorder = true },
  ref
) {
  const { layout } = scene;
  const showEn = language !== "he";
  const showHe = language !== "en";
  const both = language === "both";
  const headerOnly = mode === "header";
  // A Hebrew-only deck flips the chrome rows (eyebrow, footer) as well as the copy.
  const heOnly = language === "he";
  const cardClass = `hp-card${showBorder ? "" : " hp-no-border"}${
    headerOnly ? " hp-mode-header" : ""
  }${heOnly ? " hp-rtl-chrome" : ""}`;

  /** Edit-mode drag/resize wins over the authored geometry, on the primary card. */
  const applyPrimaryOverride = (style: React.CSSProperties): React.CSSProperties => {
    const out = { ...style };
    if (offsetX !== undefined && offsetY !== undefined) {
      out.left = `${offsetX}px`;
      out.top = `${offsetY}px`;
      out.bottom = "auto";
      out.transform = sizeScale !== 1 ? `scale(${sizeScale})` : undefined;
    }
    if (widthPx !== undefined) out.width = `${widthPx}px`;
    return out;
  };

  const enFont: React.CSSProperties = { fontFamily: fontEn };
  const heFont: React.CSSProperties = { fontFamily: fontHe };

  /* ── Archetype: band ── */
  if (layout.kind === "band") {
    const titles = (
      <>
        {showEn && (
          <div className="hp-en" style={enFont}>
            <h2 className="hp-title">{scene.titleEn}</h2>
          </div>
        )}
        {both && <div className="hp-divider" />}
        {showHe && (
          <div className="hp-he" style={heFont}>
            <h2 className="hp-title">{scene.titleHe}</h2>
          </div>
        )}
      </>
    );

    const bullets = (
      <>
        {showEn && (
          <div className="hp-en" style={enFont}>
            <Bullets items={scene.bulletsEn} lang="en" />
          </div>
        )}
        {both && <div className="hp-divider" />}
        {showHe && (
          <div className="hp-he" style={heFont}>
            <Bullets items={scene.bulletsHe} lang="he" />
          </div>
        )}
      </>
    );

    const footer = scene.dataLine && (
      <>
        <hr className="hp-rule" />
        <div className="hp-foot">
          <span className="hp-foot-label" style={enFont}>
            {showEn ? scene.hudLabel : scene.hudLabelHe}
          </span>
          <span className="hp-foot-meta">{scene.dataLine}</span>
        </div>
      </>
    );

    const detail = (
      <>
        <div className={both ? "hp-split" : ""}>{bullets}</div>
        {footer}
      </>
    );

    return (
      <div className="hp-layer" ref={ref}>
        <div
          className={`${cardClass} hp-header`}
          // In header mode the card has to be free to grow on hover, so the
          // authored max-height is dropped.
          style={applyPrimaryOverride(rectStyle(layout.header, sizeScale, !headerOnly))}
        >
          <div className="hp-eyebrow-row">
            <span className="hp-eyebrow" style={enFont}>
              {showEn ? scene.part : scene.partHe}
            </span>
            {showHe && both && (
              <span className="hp-eyebrow hp-he" style={heFont}>
                {scene.partHe}
              </span>
            )}
          </div>
          <div className={both ? "hp-split" : ""}>{titles}</div>
          {headerOnly && <Expandable>{detail}</Expandable>}
        </div>

        {!headerOnly && (
          <div className={`${cardClass} hp-body`} style={rectStyle(layout.body, sizeScale)}>
            {detail}
          </div>
        )}
      </div>
    );
  }

  /* ── Archetype: sides ── */
  const sideCard = (lang: "en" | "he") => {
    const isHe = lang === "he";
    const detail = (
      <>
        <Bullets items={isHe ? scene.bulletsHe : scene.bulletsEn} lang={lang} />
        <hr className="hp-rule" />
        <div className="hp-foot">
          <span className="hp-foot-label">{isHe ? scene.hudLabelHe : scene.hudLabel}</span>
        </div>
      </>
    );
    const rect = isHe ? layout.he : layout.en;
    const base = rectStyle(rect, sizeScale);
    return (
      <div
        className={`${cardClass} hp-side hp-side-${lang} hp-${lang}`}
        style={{
          ...(isHe ? base : applyPrimaryOverride(base)),
          ...(isHe ? heFont : enFont),
        }}
      >
        <span className="hp-eyebrow">{isHe ? scene.partHe : scene.part}</span>
        <h2 className="hp-title">{isHe ? scene.titleHe : scene.titleEn}</h2>
        {headerOnly ? <Expandable>{detail}</Expandable> : detail}
      </div>
    );
  };

  return (
    <div className="hp-layer" ref={ref}>
      {showEn && sideCard("en")}
      {showHe && sideCard("he")}
    </div>
  );
});

export default SlidePanels;
