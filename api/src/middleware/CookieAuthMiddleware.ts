import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

import { Bindings } from "@/types";
import { User } from "@/types/users";
import { z } from "zod";
import { Context } from "hono";
import { userSchema } from "@/schemas/users";
import { CookieOptions } from "hono/utils/cookie";

type Session = {
  user: User;
  expires: number;
};

const SessionSchema = z.object({
  user: userSchema,
  expires: z.number(),
});

export type CookieAuthMiddlewareVariables = {
  loggedIn: boolean;
  user: User;
  sessionId: string;
};

export const COOKIE_AUTH_TOKEN_NAME = "HonoAuthCookie";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const SESSION_REFRESH_THRESHOLD_MS = 6 * 24 * 60 * 60 * 1000; // 6 days

export const NEW_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  maxAge: SESSION_DURATION_MS / 1000,
  sameSite: "None",
};

export const LOGOUT_COOKIE_OPTIONS: CookieOptions = {
  httpOnly: true,
  secure: true,
  maxAge: -5,
  sameSite: "none",
};

export const CookieAuthMiddleware = createMiddleware<{
  Variables: CookieAuthMiddlewareVariables;
  Bindings: Bindings;
}>(async (c, next) => {
  const sessionId = getCookie(c, COOKIE_AUTH_TOKEN_NAME);
  if (!sessionId) {
    c.set("loggedIn", false);
    return await next();
  }

  const sessionRaw = await c.env.TEST_SESSION_KV.get(sessionId);
  if (!sessionRaw) {
    c.set("loggedIn", false);
    return await next();
  }

  let session: Session | null = null;

  try {
    const sessionParsed = JSON.parse(sessionRaw);
    session = SessionSchema.parse(sessionParsed);
  } catch {
    c.set("loggedIn", false);
    return await next();
  }

  const now = Date.now();
  if (!session || session.expires < Date.now()) {
    c.set("loggedIn", false);
    await deleteSession(c, sessionId);
    return await next();
  }

  const timeRemaining = session.expires - now;
  if (timeRemaining < SESSION_REFRESH_THRESHOLD_MS) {
    await updateSession(c, sessionId, session);
  }
  c.set("user", session.user);
  c.set("sessionId", sessionId);
  c.set("loggedIn", true);
  return await next();
});

export async function createSession(
  c: Context<{ Bindings: Bindings; Variables: CookieAuthMiddlewareVariables }>,
  user: User
): Promise<string> {
  const sessionId = crypto.randomUUID();
  const session: Session = {
    user,
    expires: Date.now() + 60 * 60 * 1000,
  };
  await c.env.TEST_SESSION_KV.put(sessionId, JSON.stringify(session));
  setCookie(c, COOKIE_AUTH_TOKEN_NAME, sessionId, NEW_COOKIE_OPTIONS);
  return sessionId;
}

export async function updateSession(
  c: Context<{ Bindings: Bindings; Variables: CookieAuthMiddlewareVariables }>,
  sessionId: string,
  session: Session
): Promise<string> {
  session.expires = Date.now() + SESSION_DURATION_MS;
  await c.env.TEST_SESSION_KV.put(sessionId, JSON.stringify(session));
  setCookie(c, COOKIE_AUTH_TOKEN_NAME, sessionId, NEW_COOKIE_OPTIONS);
  return sessionId;
}

export async function deleteSession(
  c: Context<{ Bindings: Bindings; Variables: CookieAuthMiddlewareVariables }>,
  sessionId: string
) {
  await c.env.TEST_SESSION_KV.delete(sessionId);
  setCookie(c, COOKIE_AUTH_TOKEN_NAME, "", LOGOUT_COOKIE_OPTIONS);
}
