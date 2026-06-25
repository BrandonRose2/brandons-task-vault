import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { ENV } from "./_core/env";

const TASK_PROMPT = `Check the iCloud Recordings Vault/Inbox folder for new audio files. For each file: transcribe it with full dialogue and timestamps, create a summary, name it by topic and date, and sort it into the appropriate folder (Meetings, Calls, Personal Notes, Marc's Inappropriate Screaming, or Other). Move both the original audio and the summary document to the correct folder. Marc's voice profile: extremely loud, abrupt escalation, sharp demanding tone, repeats names rapidly, immediately issues direct commands.`;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  recordings: router({
    trigger: publicProcedure.mutation(async () => {
      const apiKey = ENV.manusApiKey;
      if (!apiKey) {
        throw new Error("MANUS_API_KEY is not configured");
      }

      const response = await fetch("https://api.manus.ai/v2/task.create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-manus-api-key": apiKey,
        },
        body: JSON.stringify({
          message: {
            content: TASK_PROMPT,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || data.ok === false) {
        throw new Error(
          data?.error?.message || `Manus API error: ${response.status}`
        );
      }

      return { success: true, taskId: data.task_id };
    }),
  }),
});

export type AppRouter = typeof appRouter;
