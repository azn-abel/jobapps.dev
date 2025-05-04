import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { sha256 } from "hono/utils/crypto";

import * as jose from "jose";

import { Bindings } from "@jobapps.dev/shared/types/config";

import { JSONSuccess, JSONFail } from "@/classes/responseModels";

import {
  CookieAuthMiddleware,
  CookieAuthMiddlewareVariables,
  createSession,
  deleteSession,
} from "@/middleware/CookieAuthMiddleware";
import { User } from "@jobapps.dev/shared/types/users";

interface GooglePayload {
  email: string;
  name: string;
  picture: string;
}

const authRouter = new Hono<{
  Bindings: Bindings;
  Variables: CookieAuthMiddlewareVariables;
}>();

authRouter.use(CookieAuthMiddleware);

authRouter.post(
  "/login-with-google",
  zValidator("json", z.object({ token: z.string() })),
  async (c) => {
    if (c.var.loggedIn)
      return c.json(new JSONSuccess("you are already logged in"));

    const jwt = c.req.valid("json").token;
    const JWKS = jose.createRemoteJWKSet(
      new URL("https://www.googleapis.com/oauth2/v3/certs")
    );
    try {
      const {
        payload,
        protectedHeader,
      }: { payload: GooglePayload; protectedHeader: jose.JWTHeaderParameters } =
        await jose.jwtVerify(jwt, JWKS, {
          issuer: "https://accounts.google.com",
          audience: c.env.GOOGLE_CLIENT_ID,
        });

      const user: User = {
        username: payload.email,
        name: payload.name,
        picture: payload.picture,
      };
      await createSession(c, user);
      return c.json(new JSONSuccess("logged in as " + payload.email, user));
    } catch {
      return c.json(new JSONFail("error signing in"), 401);
    }
  }
);

authRouter.post("/logout", async (c) => {
  if (!c.var.loggedIn)
    return c.json(new JSONFail("brother you are not even logged in"), 401);

  await deleteSession(c, c.var.sessionId);

  return c.json(new JSONSuccess("successfully logged out", c.var.user));
});

authRouter.get("/current-user", async (c) => {
  if (!c.var.loggedIn) return c.json(new JSONFail("not authenticated"), 401);
  return c.json(new JSONSuccess("authenticated", c.var.user));
});

// Username & Password stuff below. Idk if I want it tho.

// const loginSchema = z.object({
//   username: z.string(),
//   password: z.string(),
// });

// authRouter.post("/login", zValidator("json", loginSchema), async (c) => {
//   if (c.var.loggedIn)
//     return c.json(new JSONSuccess("brother you are already logged in"));

//   const user = c.req.valid("json");
//   const userExists = await c.env.TEST_AUTH_KV.get(user.username);

//   if (!userExists || (await sha256(user.password)) !== userExists)
//     return c.json(new JSONFail("invalid username or password"), 401);

//   await createSession(c, user.username);
//   return c.json(new JSONSuccess("you have successfully logged in", user));
// });

// const registerSchema = z.object({
//   username: z.string(),
//   password: z.string().min(6).max(64),
// });

// authRouter.post("/register", zValidator("json", registerSchema), async (c) => {
//   if (c.var.loggedIn)
//     return c.json(new JSONSuccess("you are already logged in"));

//   const newUser = c.req.valid("json");
//   const userExists = await c.env.TEST_AUTH_KV.get(newUser.username);

//   if (userExists)
//     return c.json(
//       new JSONFail(`user with username ${newUser.username} already exists.`),
//       409
//     );

//   const hashPw = await sha256(newUser.password);
//   await c.env.TEST_AUTH_KV.put(newUser.username, hashPw!);

//   return c.json(new JSONSuccess("registered new user", newUser));
// });

export default authRouter;
