import { createMiddleware } from "hono/factory";
import { CookieAuthMiddlewareVariables } from "@/middleware/CookieAuthMiddleware";
import { Bindings } from "@jobapps.dev/shared/types/config";
import { JSONFail } from "@/classes/responseModels";

export const RouteProtectionMiddleware = createMiddleware<{
  Variables: CookieAuthMiddlewareVariables;
  Bindings: Bindings;
}>(async (c, next) => {
  if (!c.var.loggedIn) return c.json(new JSONFail("not authenticated"), 401);
  return await next();
});
