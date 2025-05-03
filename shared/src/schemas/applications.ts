import { z } from "zod";

export const applicationStatusSchema = z.enum([
  "New",
  "Assessment",
  "Interview",
  "Offer",
  "Rejected",
]);

export const dateStringSchema = z.string().date();

export const applicationSchema = z.object({
  id: z.string(),
  jobTitle: z.string(),
  company: z.string(),
  status: applicationStatusSchema,
  tags: z.array(z.string()),
  applicationDate: dateStringSchema,
  interviewDate: z.union([dateStringSchema, z.literal("")]),
  jobDescription: z.string(),
  lastUpdated: z.string().datetime(),
});

export const applicationDTOSchema = applicationSchema
  .omit({ id: true, lastUpdated: true })
  .extend({
    tags: z.array(z.string()).default([]),
    interviewDate: z.union([dateStringSchema, z.literal("")]).default(""),
    jobDescription: z.string().default(""),
  });

export const applicationStoreSchema = z.record(z.string(), applicationSchema);
