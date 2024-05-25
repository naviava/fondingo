import { router } from "~/server/trpc";

import {
  addExpense,
  getExpenseIds,
  getExpenseById,
  deleteExpenseById,
  getSettlements,
  getSettlementById,
  deleteSettlementById,
} from "../actions/expense";

export const expenseRouter = router({
  addExpense,
  getExpenseIds,
  getExpenseById,
  deleteExpenseById,
  getSettlements,
  getSettlementById,
  deleteSettlementById,
});
