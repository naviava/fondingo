import { publicProcedure, router } from "./trpc";

export const appRouter = router({
  getEx: publicProcedure.query(() => {
    return "Hello world!";
  }),
});

export type AppRouter = typeof appRouter;
