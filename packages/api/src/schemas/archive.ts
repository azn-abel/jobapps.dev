import { z } from "zod";
import { applicationStoreSchema } from "./applications";

export const putArchiveDTOSchema = z.object({
  applicationIds: z.array(z.string()),
});

export const archiveStoreSchema = applicationStoreSchema;
