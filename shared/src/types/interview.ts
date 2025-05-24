import { interviewResponseSchema, interviewSchema } from "../schemas/interview";
import { z } from "zod";

export type Interview = z.infer<typeof interviewSchema>;

export type InterviewResponse = z.infer<typeof interviewResponseSchema>;

export const __keepModule = true;
