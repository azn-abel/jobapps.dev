import { interviewSchema } from "../schemas/interview";
import { z } from "zod";

export type Interview = z.infer<typeof interviewSchema>;

export const __keepModule = true;
