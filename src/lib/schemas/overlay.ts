import { z } from "zod";

export const OverlayPosition = z.enum(["top-left", "top-right", "bottom-left", "bottom-right", "center", "custom"]);

export const OverlayConfig = z.object({
  id: z.string(),
  type: z.enum(["text", "image", "component"]),
  content: z.string(),
  enterAt: z.number().min(0).max(1).default(0),
  exitAt: z.number().min(0).max(1).default(1),
  position: OverlayPosition.default("center"),
  customPosition: z.object({
    x: z.string(),
    y: z.string(),
  }).optional(),
  animation: z.object({
    enter: z.string().default("fadeIn"),
    exit: z.string().default("fadeOut"),
    duration: z.number().default(0.5),
  }).optional(),
});
export type OverlayConfig = z.infer<typeof OverlayConfig>;
