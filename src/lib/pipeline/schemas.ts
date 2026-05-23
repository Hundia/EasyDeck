import { z } from "zod";
import { TransitionMode } from "@/lib/schemas/transition";

export const SceneBrief = z.object({
  label: z.string().min(1),
  description: z.string().default(""),
  durationHint: z.number().positive().default(5),
  overlayText: z.string().optional(),
});
export type SceneBrief = z.infer<typeof SceneBrief>;

export const ContentBrief = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  scenes: z.array(SceneBrief).min(1),
  mode: TransitionMode.optional(),
  fps: z.number().int().min(1).max(120).default(30),
  imagePattern: z.string().default("/frames/frame-{index}.webp"),
});
export type ContentBrief = z.infer<typeof ContentBrief>;
