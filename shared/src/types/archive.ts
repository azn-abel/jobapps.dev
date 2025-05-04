import { archiveStoreSchema, putArchiveDTOSchema } from "../schemas/archive";
import { z } from "zod";

export type PutArchiveDTO = z.infer<typeof putArchiveDTOSchema>;

export type ArchiveStore = z.infer<typeof archiveStoreSchema>;

export const __keepModule = true;
