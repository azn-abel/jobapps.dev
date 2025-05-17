import { userSchema } from "../schemas/users";
import { z } from "zod";

export type User = z.infer<typeof userSchema>;

export const __keepModule = true;
