import { router } from "./trpc";

import { expenseRouter } from "./routers/expense-router";
import { groupRouter } from "./routers/group-router";
import { userRouter } from "./routers/user-router";
import { logsRouter } from "./routers/logs-router";
import { miscRouter } from "./routers/misc-router";

export { fetchRequestHandler } from "@trpc/server/adapters/fetch";
export { createCallerFactory } from "./trpc";
export type AppRouter = typeof appRouter;
export const appRouter = router({
  user: userRouter,
  group: groupRouter,
  expense: expenseRouter,
  logs: logsRouter,
  misc: miscRouter,
});
