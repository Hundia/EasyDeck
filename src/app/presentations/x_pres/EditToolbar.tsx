"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Types ───────────────────────────────────────────────────────── */

export interface PanelOverride {
  x?: number;
  y?: number;
  width?: number;
  border?: boolean;
  fontEn?: string;
  fontHe?: string;
}

export interface ExtraTextBox {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  border: boolean;
  fontFamily: string;
  fontSize: number;
}

export type PanelOverrides = Record<number, PanelOverride>;
export type TextBoxes = Record<number, ExtraTextBox[]>;

const POSITION_PRESETS = [
  { label: "↙", position: "bottom-left", tooltip: "Bottom Left" },
  { label: "↘", position: "bottom-right", tooltip: "Bottom Right" },
  { label: "⬇", position: "bottom-center", tooltip: "Bottom Center" },
  { label: "↖", position: "top-left", tooltip: "Top Left" },
  { label: "↗", position: "top-right", tooltip: "Top Right" },
] as const;

export const FONTS_EN = [
  { name: "Inter", family: "'Inter', sans-serif" },
  { name: "Space Grotesk", family: "'Space Grotesk', sans-serif" },
  { name: "JetBrains Mono", family: "'JetBrains Mono', monospace" },
  { name: "Playfair Display", family: "'Playfair Display', serif" },
] as const;

export const FONTS_HE = [
  { name: "Heebo", family: "'Heebo', sans-serif" },
  { name: "Rubik", family: "'Rubik', sans-serif" },
  { name: "Assistant", family: "'Assistant', sans-serif" },
  { name: "Frank Ruhl Libre", family: "'Frank Ruhl Libre', serif" },
] as const;

export const ALL_FONTS = [...FONTS_EN, ...FONTS_HE] as const;

const STORAGE_KEY = "x-pres-panel-overrides";
const TEXTBOX_STORAGE_KEY = "x-pres-extra-textboxes";

export function loadOverrides(): PanelOverrides {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveOverrides(overrides: PanelOverrides): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides));
}

export function loadTextBoxes(): TextBoxes {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(TEXTBOX_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveTextBoxes(boxes: TextBoxes): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TEXTBOX_STORAGE_KEY, JSON.stringify(boxes));
}

/* ─── Edit Toolbar Component ─────────────────────────────────────── */

interface EditToolbarProps {
  sceneIndex: number;
  overrides: PanelOverrides;
  onUpdate: (sceneIndex: number, patch: Partial<PanelOverride>) => void;
  accentColor: string;
  onPositionPreset: (position: string) => void;
  textBoxes: ExtraTextBox[];
  onAddTextBox: () => void;
  onUpdateTextBox: (boxId: string, patch: Partial<ExtraTextBox>) => void;
  onDeleteTextBox: (boxId: string) => void;
  selectedTextBox: string | null;
  onSelectTextBox: (boxId: string | null) => void;
}

export function EditToolbar({ sceneIndex, overrides, onUpdate, accentColor, onPositionPreset, textBoxes, onAddTextBox, onUpdateTextBox, onDeleteTextBox, selectedTextBox, onSelectTextBox }: EditToolbarProps) {
  const current = overrides[sceneIndex] || {};
  const [activeSection, setActiveSection] = useState<"position" | "size" | "border" | "font" | "textboxes" | null>(null);

  const handleStopPropagation = useCallback((e: React.PointerEvent | React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  const width = current.width ?? 450;
  const border = current.border ?? true;
  const fontEn = current.fontEn ?? FONTS_EN[0].family;
  const fontHe = current.fontHe ?? FONTS_HE[0].family;

  const selectedBox = textBoxes.find((b) => b.id === selectedTextBox);

  return (
    <motion.div
      className="x-pres-edit-toolbar"
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      onPointerDown={handleStopPropagation}
      onMouseDown={handleStopPropagation}
      onTouchStart={handleStopPropagation}
      onClick={handleStopPropagation}
    >
      <div className="x-pres-edit-toolbar-header">
        <span className="x-pres-edit-badge" style={{ color: accentColor }}>✎ EDIT</span>
        <span className="x-pres-edit-scene-label">Slide {sceneIndex + 1}</span>
      </div>

      {/* Section Tabs */}
      <div className="x-pres-edit-tabs">
        {(["position", "size", "border", "font", "textboxes"] as const).map((section) => (
          <button
            key={section}
            className={`x-pres-edit-tab ${activeSection === section ? "active" : ""}`}
            style={activeSection === section ? { borderColor: accentColor } : {}}
            onClick={(e) => { e.stopPropagation(); setActiveSection(activeSection === section ? null : section); }}
            title={section === "textboxes" ? "Add / manage text boxes" : section}
          >
            {section === "position" ? "📍" : section === "size" ? "↔" : section === "border" ? "▢" : section === "font" ? "𝐀" : "＋T"}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Position Section */}
        {activeSection === "position" && (
          <motion.div
            key="position"
            className="x-pres-edit-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="x-pres-edit-label">Position</div>
            <div className="x-pres-edit-position-grid">
              {POSITION_PRESETS.map((p) => (
                <button
                  key={p.position}
                  className="x-pres-edit-pos-btn"
                  title={p.tooltip}
                  onClick={(e) => { e.stopPropagation(); onPositionPreset(p.position); }}
                >
                  {p.label}
                </button>
              ))}
              <button
                className="x-pres-edit-pos-btn"
                title="Free drag (hold & move panel)"
                style={{ fontSize: "0.6rem" }}
                onClick={(e) => { e.stopPropagation(); }}
              >
                ✥
              </button>
            </div>
            <div className="x-pres-edit-hint">Click a preset or drag the panel directly</div>
          </motion.div>
        )}

        {/* Size Section */}
        {activeSection === "size" && (
          <motion.div
            key="size"
            className="x-pres-edit-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="x-pres-edit-label">Width: {width}px</div>
            <input
              type="range"
              className="x-pres-edit-slider"
              min={300}
              max={700}
              value={width}
              onChange={(e) => { e.stopPropagation(); onUpdate(sceneIndex, { width: Number(e.target.value) }); }}
              onPointerDown={handleStopPropagation}
              style={{ accentColor }}
            />
            <div className="x-pres-edit-range-labels">
              <span>300px</span><span>700px</span>
            </div>
          </motion.div>
        )}

        {/* Border Section */}
        {activeSection === "border" && (
          <motion.div
            key="border"
            className="x-pres-edit-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="x-pres-edit-label">Border</div>
            <button
              className={`x-pres-edit-toggle ${border ? "on" : "off"}`}
              style={border ? { background: accentColor } : {}}
              onClick={(e) => { e.stopPropagation(); onUpdate(sceneIndex, { border: !border }); }}
            >
              {border ? "ON" : "OFF"}
            </button>
          </motion.div>
        )}

        {/* Font Section */}
        {activeSection === "font" && (
          <motion.div
            key="font"
            className="x-pres-edit-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="x-pres-edit-label">English Font</div>
            <div className="x-pres-edit-font-list">
              {FONTS_EN.map((f) => (
                <button
                  key={f.name}
                  className={`x-pres-edit-font-btn ${fontEn === f.family ? "active" : ""}`}
                  style={{ fontFamily: f.family, borderColor: fontEn === f.family ? accentColor : undefined }}
                  onClick={(e) => { e.stopPropagation(); onUpdate(sceneIndex, { fontEn: f.family }); }}
                >
                  {f.name}
                </button>
              ))}
            </div>
            <div className="x-pres-edit-label" style={{ marginTop: 8 }}>Hebrew Font</div>
            <div className="x-pres-edit-font-list">
              {FONTS_HE.map((f) => (
                <button
                  key={f.name}
                  className={`x-pres-edit-font-btn ${fontHe === f.family ? "active" : ""}`}
                  style={{ fontFamily: f.family, borderColor: fontHe === f.family ? accentColor : undefined }}
                  onClick={(e) => { e.stopPropagation(); onUpdate(sceneIndex, { fontHe: f.family }); }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Text Boxes Section */}
        {activeSection === "textboxes" && (
          <motion.div
            key="textboxes"
            className="x-pres-edit-section"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="x-pres-edit-label">Text Boxes ({textBoxes.length})</div>

            {/* Add button */}
            <button
              className="x-pres-edit-add-btn"
              style={{ borderColor: `${accentColor}66`, color: accentColor }}
              onClick={(e) => { e.stopPropagation(); onAddTextBox(); }}
            >
              + Add Text Box
            </button>

            {/* List of text boxes */}
            {textBoxes.length > 0 && (
              <div className="x-pres-edit-textbox-list">
                {textBoxes.map((box, idx) => (
                  <div
                    key={box.id}
                    className={`x-pres-edit-textbox-item ${selectedTextBox === box.id ? "selected" : ""}`}
                    style={selectedTextBox === box.id ? { borderColor: accentColor } : {}}
                    onClick={(e) => { e.stopPropagation(); onSelectTextBox(selectedTextBox === box.id ? null : box.id); }}
                  >
                    <span className="x-pres-edit-textbox-name">Box {idx + 1}</span>
                    <button
                      className="x-pres-edit-textbox-delete"
                      onClick={(e) => { e.stopPropagation(); onDeleteTextBox(box.id); }}
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Selected text box controls */}
            {selectedBox && (
              <div className="x-pres-edit-textbox-controls">
                <div className="x-pres-edit-label" style={{ marginTop: 8 }}>Border</div>
                <button
                  className={`x-pres-edit-toggle ${selectedBox.border ? "on" : "off"}`}
                  style={selectedBox.border ? { background: accentColor } : {}}
                  onClick={(e) => { e.stopPropagation(); onUpdateTextBox(selectedBox.id, { border: !selectedBox.border }); }}
                >
                  {selectedBox.border ? "ON" : "OFF"}
                </button>

                <div className="x-pres-edit-label" style={{ marginTop: 8 }}>Font</div>
                <div className="x-pres-edit-font-list">
                  {ALL_FONTS.map((f) => (
                    <button
                      key={f.name}
                      className={`x-pres-edit-font-btn ${selectedBox.fontFamily === f.family ? "active" : ""}`}
                      style={{ fontFamily: f.family, borderColor: selectedBox.fontFamily === f.family ? accentColor : undefined }}
                      onClick={(e) => { e.stopPropagation(); onUpdateTextBox(selectedBox.id, { fontFamily: f.family }); }}
                    >
                      {f.name}
                    </button>
                  ))}
                </div>

                <div className="x-pres-edit-label" style={{ marginTop: 8 }}>Size: {selectedBox.fontSize}px</div>
                <input
                  type="range"
                  className="x-pres-edit-slider"
                  min={12}
                  max={72}
                  value={selectedBox.fontSize}
                  onChange={(e) => { e.stopPropagation(); onUpdateTextBox(selectedBox.id, { fontSize: Number(e.target.value) }); }}
                  onPointerDown={handleStopPropagation}
                  style={{ accentColor }}
                />

                <div className="x-pres-edit-label" style={{ marginTop: 8 }}>Width: {selectedBox.width}px</div>
                <input
                  type="range"
                  className="x-pres-edit-slider"
                  min={100}
                  max={800}
                  value={selectedBox.width}
                  onChange={(e) => { e.stopPropagation(); onUpdateTextBox(selectedBox.id, { width: Number(e.target.value) }); }}
                  onPointerDown={handleStopPropagation}
                  style={{ accentColor }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
