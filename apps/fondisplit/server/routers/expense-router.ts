import { router } from "~/server/trpc";

import {
  getExpenseIds,
  getExpenseById,
  deleteExpenseById,
  getSettlements,
  getSettlementById,
  deleteSettlementById,
} from "../actions/expense";

export const expenseRouter = router({
  getExpenseIds,
  getExpenseById,
  deleteExpenseById,
  getSettlements,
  getSettlementById,
  deleteSettlementById,
});
