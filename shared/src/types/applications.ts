import {
  applicationDTOSchema,
  applicationSchema,
  applicationStatusSchema,
  applicationStoreSchema,
  dateStringSchema,
} from "../schemas/applications";
import { z } from "zod";

export type ApplicationStatus = z.infer<typeof applicationStatusSchema>;

export type DateString = z.infer<typeof dateStringSchema>;

export type Application = z.infer<typeof applicationSchema>;

export type ApplicationDTO = z.infer<typeof applicationDTOSchema>;

export type ApplicationStore = z.infer<typeof applicationStoreSchema>;

export const __keepModule = true;
