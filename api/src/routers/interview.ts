import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

import OpenAI from "openai";

import { Bindings } from "@jobapps.dev/shared/types/config";

import { JSONFail, JSONSuccess } from "@/classes/responseModels";

import {
  CookieAuthMiddleware,
  CookieAuthMiddlewareVariables,
} from "@/middleware/CookieAuthMiddleware";
import { HTTPException } from "hono/http-exception";
import { RouteProtectionMiddleware } from "@/middleware/RouteProtectionMiddleware";

const interviewRouter = new Hono<{
  Bindings: Bindings;
  Variables: CookieAuthMiddlewareVariables;
}>();

interviewRouter.use(CookieAuthMiddleware);
interviewRouter.use(RouteProtectionMiddleware);

interviewRouter.get(
  "/",
  zValidator("query", z.object({ company: z.string(), role: z.string() })),
  async (c) => {
    const kv = c.env.TEST_INTERVIEW_LIMIT_KV;
    const username = c.var.user.username;
    const today = new Date().toISOString().slice(0, 10);
    const key = `rate:${username}:${today}`;

    const countStr = await kv.get(key);
    const count = parseInt(countStr || "0", 10);

    if (count >= 15) {
      return c.json(new JSONFail("out of generations for today"), 429);
    }

    await kv.put(key, (count + 1).toString(), { expirationTtl: 86400 });

    const company = c.req.valid("query").company;
    const role = c.req.valid("query").role;

    const client = new OpenAI({
      apiKey: c.env.OPENAI_API_KEY as unknown as string,
    });

    const retries = 3;

    while (retries > 0) {
      const response = await client.responses.create({
        model: "gpt-4.1",
        instructions: `You are chatbot supporting a hiring manager at ${company} and you are
        interviewing a candidate for a ${role} position. Your task is to generate interview questions
        that are relevant to the ${role} position. You will be generating interview questions,
        and you must return them in a JSON format. The JSON should just be a list of strings,
        and nothing else. Do not include any other text or explanation.
        The questions should be open-ended and should require the candidate to explain their
        thought process and reasoning. Some of the questions should be ${company}-specific.
        Start broad with culture fit questions, then narrow down to job-specific questions.
        Order them from broad to narrow. Again, do not include any other text or explanation.
        `,
        input: `Generate 5 interview questions that are relevant to the ${role} position at ${company}.`,
        user: c.var.user.username,
      });
      try {
        const text = response.output_text;
        const questions = JSON.parse(text);
        return c.json(
          new JSONSuccess("successfully generated questions", questions)
        );
      } catch {
        throw new HTTPException(500, {
          message: "unable to generate interview questions",
        });
      }
    }
  }
);

export default interviewRouter;
