import { router } from "~/server/trpc";

import {
  getExpenseIds,
  getExpenseById,
  deleteExpenseById,
} from "../actions/expense";

export const expenseRouter = router({
  getExpenseIds,
  getExpenseById,
  deleteExpenseById,
});
