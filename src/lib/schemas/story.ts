import { z } from "zod";
import { TransitionConfig } from "./transition";
import { SceneConfig } from "./scene";

export const StorySchema = z.object({
  meta: z.object({
    title: z.string().min(1),
    slug: z.string().min(1),
  }),
  transition: TransitionConfig,
  scenes: z.array(SceneConfig).min(1),
  pauseLenisInSection: z.boolean().default(true),
  reducedMotionFallback: z.enum(["disable", "scrub-instant", "static"]).default("scrub-instant"),
}).superRefine((story, ctx) => {
  if (story.transition.mode === "section") {
    for (let i = 0; i < story.scenes.length - 1; i++) {
      if (story.scenes[i].endFrame !== story.scenes[i + 1].startFrame) {
        ctx.addIssue({
          code: "custom",
          path: ["scenes", i + 1, "startFrame"],
          message: `Section-mode scenes must be frame-contiguous (scene ${i} endFrame ${story.scenes[i].endFrame} !== scene ${i + 1} startFrame ${story.scenes[i + 1].startFrame})`,
        });
      }
    }
  }
});
export type StorySchema = z.infer<typeof StorySchema>;
