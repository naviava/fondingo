import { router } from "./trpc";

import { userRouter } from "./routers/user-router";
import { groupRouter } from "./routers/group-router";
import { expenseRouter } from "./routers/expense-router";

export const appRouter = router({
  user: userRouter,
  group: groupRouter,
  expense: expenseRouter,
});

export type AppRouter = typeof appRouter;
export { createCallerFactory } from "./trpc";
