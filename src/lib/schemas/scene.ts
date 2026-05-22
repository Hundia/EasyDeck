import { z } from "zod";
import { OverlayConfig } from "./overlay";
import { TransitionConfig } from "./transition";

export const SceneConfig = z.object({
  id: z.string(),
  label: z.string(),
  startFrame: z.number().int().min(0),
  endFrame: z.number().int().min(0),
  imageSequence: z.object({
    pattern: z.string(),
    frameCount: z.number().int().min(1),
  }),
  overlays: z.array(OverlayConfig).default([]),
  transition: TransitionConfig.partial().optional(),
}).refine(
  (s) => s.endFrame > s.startFrame,
  { message: "endFrame must be greater than startFrame", path: ["endFrame"] }
);
export type SceneConfig = z.infer<typeof SceneConfig>;
