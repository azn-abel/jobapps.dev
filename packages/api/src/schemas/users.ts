import { z } from "zod";

export const userSchema = z.object({
  username: z.string(),
  name: z.string(),
  picture: z.string(),
});
