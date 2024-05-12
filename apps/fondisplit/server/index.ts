import { router } from "./trpc";

import { userRouter } from "./routers/user-router";
import { groupRouter } from "./routers/group-router";

export const appRouter = router({
  user: userRouter,
  group: groupRouter,
});

export type AppRouter = typeof appRouter;
