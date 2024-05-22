import { router } from "~/server/trpc";

import { getExpenseIds, getExpenseById } from "../actions/expense";

export const expenseRouter = router({
  getExpenseIds,
  getExpenseById,
});
