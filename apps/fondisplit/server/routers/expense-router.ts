import { router } from "~/server/trpc";

import {
  addExpense,
  updateExpense,
  getExpenseIds,
  getExpenseById,
  deleteExpenseById,
  getSettlements,
  getSettlementById,
  deleteSettlementById,
} from "../actions/expense";

export const expenseRouter = router({
  addExpense,
  updateExpense,
  getExpenseIds,
  getExpenseById,
  deleteExpenseById,
  getSettlements,
  getSettlementById,
  deleteSettlementById,
});
