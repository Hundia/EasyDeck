import { z } from "zod";

export const TransitionMode = z.enum(["scrub", "snap", "section"]);
export type TransitionMode = z.infer<typeof TransitionMode>;

export const EaseId = z.enum([
  "none", "power1.inOut", "power2.inOut", "power2.out",
  "power3.inOut", "power4.inOut", "expo.inOut", "circ.inOut",
]);
export type EaseId = z.infer<typeof EaseId>;

export const TransitionConfig = z.object({
  mode: TransitionMode.default("section"),
  duration: z.number().min(0).max(5).default(1.0),
  ease: EaseId.default("power2.inOut"),
  directional: z.boolean().default(true),
  inertia: z.boolean().default(true),
  wrapEnabled: z.boolean().default(false),
  tolerance: z.number().int().min(1).max(200).default(10),
  showPagination: z.boolean().default(true),
  enableKeyboard: z.boolean().default(true),
  snapDelay: z.number().min(0).max(2).default(0.1),
  snapDurationMin: z.number().default(0.2),
  snapDurationMax: z.number().default(1.5),
});
export type TransitionConfig = z.infer<typeof TransitionConfig>;
