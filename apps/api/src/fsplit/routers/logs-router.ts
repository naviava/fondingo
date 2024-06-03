import { router } from "../trpc";

import {
  userLogs,
  groupByIdLogs,
  expenseByIdLogs,
  settlementByIdLogs,
} from "../actions/logs";

export const logsRouter = router({
  userLogs,
  groupByIdLogs,
  expenseByIdLogs,
  settlementByIdLogs,
});
