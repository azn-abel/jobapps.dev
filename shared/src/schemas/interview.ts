import { z } from "zod";

export const interviewSchema = z.string();

export const interviewResponseSchema = z.object({
  remaining: z.number(),
  questions: z.array(interviewSchema),
});
