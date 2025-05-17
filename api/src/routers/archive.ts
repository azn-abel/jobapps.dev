import { JSONFail, JSONSuccess } from "@/classes/responseModels";
import { Bindings } from "@jobapps.dev/shared/types/config";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import {
  CookieAuthMiddleware,
  CookieAuthMiddlewareVariables,
} from "@/middleware/CookieAuthMiddleware";
import { RouteProtectionMiddleware } from "@/middleware/RouteProtectionMiddleware";
import { applicationStoreSchema } from "@jobapps.dev/shared/schemas/applications";
import { ApplicationStore } from "@jobapps.dev/shared/types/applications";
import { encryptAndPut, getAndDecrypt } from "@/io/encryptedKV";
import {
  archiveStoreSchema,
  putArchiveDTOSchema,
} from "@jobapps.dev/shared/schemas/archive";
import { ArchiveStore } from "@jobapps.dev/shared/types/archive";

const archiveRouter = new Hono<{
  Bindings: Bindings;
  Variables: CookieAuthMiddlewareVariables;
}>();

archiveRouter.use(CookieAuthMiddleware);
archiveRouter.use(RouteProtectionMiddleware);

archiveRouter.get("/", async (c) => {
  const kv = c.env.TEST_ARCHIVE_KV;
  const secret = c.env.TEST_ENCRYPTION_SECRET_KEY as unknown as string;
  const username = c.var.user.username;

  let archiveStore: ArchiveStore;

  try {
    let archiveParsed = await getAndDecrypt<ArchiveStore>(kv, username, secret);
    if (!archiveParsed) {
      archiveParsed = {};
      await encryptAndPut(kv, username, {}, secret);
    }
    archiveStore = archiveStoreSchema.parse(archiveParsed);
  } catch (e) {
    console.log(e);
    return c.json(new JSONFail("user data corrupted"), 500);
  }

  return c.json(
    new JSONSuccess(
      `returning ${Object.keys(archiveStore).length} archived applications`,
      archiveStore
    )
  );
});

archiveRouter.post("/", zValidator("json", putArchiveDTOSchema), async (c) => {
  const applicationIds: string[] = c.req.valid("json").applicationIds;

  const applicationsKV = c.env.TEST_APPLICATION_KV;
  const archiveKV = c.env.TEST_ARCHIVE_KV;
  const username = c.var.user.username;

  const secret = c.env.TEST_ENCRYPTION_SECRET_KEY as unknown as string;

  let applicationStore: ApplicationStore;
  let archiveStore: ArchiveStore;

  try {
    let applicationsParsed = await getAndDecrypt<ApplicationStore>(
      applicationsKV,
      username,
      secret
    );
    if (!applicationsParsed) {
      applicationsParsed = {};
      await encryptAndPut(applicationsKV, username, {}, secret);
    }
    applicationStore = applicationStoreSchema.parse(applicationsParsed);
  } catch (e) {
    return c.json(new JSONFail("application data corrupted"), 500);
  }

  try {
    let archiveParsed = await getAndDecrypt<ArchiveStore>(
      archiveKV,
      username,
      secret
    );
    if (!archiveParsed) {
      archiveParsed = {};
      await encryptAndPut(archiveKV, username, {}, secret);
    }
    archiveStore = archiveStoreSchema.parse(archiveParsed);
  } catch (e) {
    console.log(e);
    return c.json(new JSONFail("archive data corrupted"), 500);
  }

  let count = 0;
  for (let id of applicationIds) {
    if (applicationStore[id]) {
      archiveStore[id] = applicationStore[id];
      delete applicationStore[id];
      count++;
    }
  }

  try {
    await encryptAndPut(applicationsKV, username, applicationStore, secret);
  } catch {
    return c.json(new JSONFail("error writing to applications KV"));
  }

  try {
    await encryptAndPut(archiveKV, username, archiveStore, secret);
  } catch {
    return c.json(new JSONFail("error writing to archive KV"));
  }

  return c.json(new JSONSuccess(`archived ${count} applications`));
});

archiveRouter.put("/", async (c) => {
  return c.json(new JSONFail("not yet implemented"));
});

archiveRouter.delete("/", async (c) => {
  return c.json(new JSONFail("not yet implemented"));
});

archiveRouter.put("/:id", async (c) => {
  return c.json(new JSONFail("not yet implemented"));
});

archiveRouter.delete("/:id", async (c) => {
  return c.json(new JSONFail("not yet implemented"));
});

export default archiveRouter;
