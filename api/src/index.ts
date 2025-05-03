import { Hono } from "hono";
import { cors } from "hono/cors";

import { Bindings } from "@/types";

import { JSONSuccess } from "@/classes/responseModels";

import authRouter from "@/routers/auth";
import applicationsRouter from "@/routers/applications";
import archiveRouter from "./routers/archive";

const app = new Hono<{ Bindings: Bindings }>();

app.use(
  cors({
    origin: (origin) => {
      return origin.endsWith(".jobapps.pages.dev") ||
        origin.endsWith("jobapps.dev")
        ? origin
        : "https://jobapps.dev";
    },
    allowMethods: ["POST", "GET", "OPTIONS", "DELETE", "PUT"],
    maxAge: 600,
    credentials: true,
  })
);

app.route("/api/auth", authRouter);
app.route("/api/applications", applicationsRouter);
app.route("/api/archive", archiveRouter);

app.get("/api", (c) => {
  return c.json(new JSONSuccess("Hello Cloudflare Workers!"));
});

export default app;
