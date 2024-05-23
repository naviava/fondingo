import { router } from "~/server/trpc";

import {
  getExpenseIds,
  getExpenseById,
  deleteExpenseById,
  getSettlements,
} from "../actions/expense";

export const expenseRouter = router({
  getExpenseIds,
  getExpenseById,
  deleteExpenseById,
  getSettlements,
});
