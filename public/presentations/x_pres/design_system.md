# Operational Story — Text Overlay Design System

This document defines the visual standards for overlaying explanation text on the cinematic images generated for the Intelligence Software Department presentation.

## 1. Color Palette

These colors are derived from the project's visual style guide to ensure text elements feel like a native part of the "HUD" or "Command Center" environment.

| Element | Color Name | Hex Code | Usage |
| :--- | :--- | :--- | :--- |
| **Primary Text** | High-Contrast Silver | `#F8FAFC` | Main explanation body text and titles. |
| **Secondary Text** | Muted Slate | `#94A3B8` | Meta-data, labels, and less critical info. |
| **HUD Header** | Neon Cyan | `#00D4FF` | Section headers, technical callouts, "Active" states. |
| **Human Element** | Warm Gold | `#FFB830` | Highlights, human-centric notes, "Intent" markers. |
| **Alert / Threat** | Signal Red | `#FF2E3B` | Critical warnings, hostile markers, cyber-attack text. |
| **Success / Link** | Operations Green | `#00E676` | Restored status, completed tasks, "Safe" zones. |
| **Backdrop** | Glassmorphism Ink | `#0D1117CC` | Semi-transparent background for text legibility (80% opacity). |

## 2. Typography

To maintain the "near-future military realism" aesthetic, use clean, geometric sans-serif fonts paired with monospaced accents.

### Primary Font: **Inter** or **Montserrat**
*   **Headings:** Bold / Semi-bold (All Caps for a more "military" feel).
*   **Body:** Regular (High legibility).

### Technical Font: **JetBrains Mono** or **Fira Code**
*   **Usage:** GPS coordinates, timestamps, log entries, and code snippets.
*   **Style:** Medium weight.

## 3. Legibility & Layout

Since many images have high-contrast lighting (bright desert sun vs. deep shadows), follow these rules for overlay placement:

*   **Text Shadows:** Always apply a subtle drop shadow (`rgba(0,0,0,0.5)`) or a 2px blur glow to text to ensure it separates from complex backgrounds.
*   **Glassmorphism Panels:** For long explanations, place text inside a semi-transparent dark box (`#0D1117` at 70-80% opacity) with a 1px border of `Neon Cyan` (`#00D4FF`).
*   **Safe Zones:** Keep text at least 80px from the edges of the 1920x1080 frame.
*   **HUD Elements:** Use thin lines (1px) and "corner bracket" frames around important text blocks to mimic a tactical display.

## 4. Visual Hierarchy Example

*   **Title (HUD Header):** `SCENE 01 // INFILTRATION DETECTED`
*   **Subtitle (High-Contrast Silver):** "Hostile movement confirmed in sector 7G."
*   **Data (Technical Font / Muted Slate):** `COORD: 31.2588° N, 34.7997° E | ALT: 240m`
*   **Action (Warm Gold):** "Human Analyst reviewing signature..."
