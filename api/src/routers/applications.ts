import { JSONFail, JSONSuccess } from "@/classes/responseModels";
import { Bindings } from "@jobapps.dev/shared/types/config";
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";

import {
  CookieAuthMiddleware,
  CookieAuthMiddlewareVariables,
} from "@/middleware/CookieAuthMiddleware";
import { RouteProtectionMiddleware } from "@/middleware/RouteProtectionMiddleware";
import {
  applicationDTOSchema,
  applicationStoreSchema,
} from "@jobapps.dev/shared/schemas/applications";
import {
  Application,
  ApplicationStore,
} from "@jobapps.dev/shared/types/applications";
import { encryptAndPut, getAndDecrypt } from "@/io/encryptedKV";

const applicationsRouter = new Hono<{
  Bindings: Bindings;
  Variables: CookieAuthMiddlewareVariables;
}>();

applicationsRouter.use(CookieAuthMiddleware);
applicationsRouter.use(RouteProtectionMiddleware);

applicationsRouter.get("/", async (c) => {
  const kv = c.env.TEST_APPLICATION_KV;
  const secret = c.env.TEST_ENCRYPTION_SECRET_KEY as unknown as string;
  const username = c.var.user.username;

  let applicationStore: ApplicationStore;

  try {
    let applicationsParsed = await getAndDecrypt<ApplicationStore>(
      kv,
      username,
      secret
    );
    if (!applicationsParsed) {
      applicationsParsed = {};
      await encryptAndPut(kv, username, {}, secret);
    }
    applicationStore = applicationStoreSchema.parse(applicationsParsed);
  } catch (e) {
    console.log(e);
    return c.json(new JSONFail("user data corrupted"), 500);
  }

  return c.json(
    new JSONSuccess(
      `returning ${Object.keys(applicationStore).length} applications`,
      applicationStore
    )
  );
});

applicationsRouter.post(
  "/",
  zValidator("json", applicationDTOSchema),
  async (c) => {
    const kv = c.env.TEST_APPLICATION_KV;
    const secret = c.env.TEST_ENCRYPTION_SECRET_KEY as unknown as string;
    const username = c.var.user.username;

    let applicationStore: ApplicationStore | null = null;

    try {
      let applicationsParsed = await getAndDecrypt<ApplicationStore>(
        kv,
        username,
        secret
      );
      if (!applicationsParsed) {
        applicationsParsed = {};
        await encryptAndPut(kv, username, {}, secret);
      }
      applicationStore = applicationStoreSchema.parse(applicationsParsed);
    } catch {
      return c.json(new JSONFail("user data corrupted"), 500);
    }

    const body = c.req.valid("json");
    const newApplication: Application = {
      id: crypto.randomUUID(),
      ...body,
      lastUpdated: new Date().toISOString(),
    };

    applicationStore[newApplication.id] = newApplication;

    try {
      await encryptAndPut(kv, username, applicationStore, secret);
      return c.json(
        new JSONSuccess("successfully added application", newApplication)
      );
    } catch {
      return c.json(new JSONFail("failed to write to kv"), 500);
    }
  }
);

applicationsRouter.put("/", async (c) => {
  return c.json(new JSONFail("not yet implemented"), 500);
});

applicationsRouter.delete("/", async (c) => {
  const idsString = c.req.query("ids");
  if (!idsString)
    return c.json(new JSONFail("no ids specified for deletion"), 400);

  const applicationIds = idsString.split(",");

  const kv = c.env.TEST_APPLICATION_KV;
  const secret = c.env.TEST_ENCRYPTION_SECRET_KEY as unknown as string;
  const username = c.var.user.username;

  let applicationStore: ApplicationStore | null = null;

  try {
    let applicationsParsed = await getAndDecrypt<ApplicationStore>(
      kv,
      username,
      secret
    );
    if (!applicationsParsed) {
      applicationsParsed = {};
      await encryptAndPut(kv, username, {}, secret);
    }
    applicationStore = applicationStoreSchema.parse(applicationsParsed);
  } catch {
    return c.json(new JSONFail("user data corrupted"), 500);
  }

  let count = 0;
  for (let id of applicationIds) {
    if (applicationStore[id]) {
      delete applicationStore[id];
      count++;
    }
  }

  try {
    await encryptAndPut(kv, username, applicationStore, secret);
    return c.json(new JSONSuccess(`deleted ${count} applications`));
  } catch {
    return c.json(new JSONFail("failed to write to kv"), 500);
  }
});

applicationsRouter.put(
  "/:id",
  zValidator("json", applicationDTOSchema),
  async (c) => {
    const id = c.req.param("id");

    const kv = c.env.TEST_APPLICATION_KV;
    const secret = c.env.TEST_ENCRYPTION_SECRET_KEY as unknown as string;
    const username = c.var.user.username;

    const applicationDto = c.req.valid("json");

    let applicationStore: ApplicationStore | null = null;

    try {
      let applicationsParsed = await getAndDecrypt<ApplicationStore>(
        kv,
        username,
        secret
      );
      if (!applicationsParsed) {
        applicationsParsed = {};
        await encryptAndPut(kv, username, {}, secret);
      }
      applicationStore = applicationStoreSchema.parse(applicationsParsed);
    } catch {
      return c.json(new JSONFail("user data corrupted"), 500);
    }

    if (!applicationStore[id])
      return c.json(
        new JSONFail("could not find application with id " + id),
        404
      );

    const application: Application = {
      id,
      ...applicationDto,
      lastUpdated: new Date().toISOString(),
    };
    applicationStore[id] = application;

    try {
      await encryptAndPut(kv, username, applicationStore, secret);
      return c.json(new JSONSuccess(`updated application`));
    } catch {
      return c.json(new JSONFail("failed to write to kv"), 500);
    }
  }
);

applicationsRouter.delete("/:id", async (c) => {
  const kv = c.env.TEST_APPLICATION_KV;
  const secret = c.env.TEST_ENCRYPTION_SECRET_KEY as unknown as string;
  const username = c.var.user.username;
  const id = c.req.param("id");

  let applicationStore: ApplicationStore;

  try {
    let applicationsParsed = await getAndDecrypt<ApplicationStore>(
      kv,
      username,
      secret
    );
    if (!applicationsParsed) {
      applicationsParsed = {};
      await encryptAndPut(kv, username, {}, secret);
    }
    applicationStore = applicationStoreSchema.parse(applicationsParsed);
  } catch (e) {
    console.log(e);
    return c.json(new JSONFail("user data corrupted"), 500);
  }

  delete applicationStore[id];

  try {
    await encryptAndPut(kv, username, applicationStore, secret);
    return c.json(new JSONSuccess("deleted application if it exists"));
  } catch {
    return c.json(new JSONFail("failed to write to kv"), 500);
  }
});

export default applicationsRouter;
