import { router } from "../trpc";

import { expenseByIdLogs, settlementByIdLogs, userLogs } from "../actions/logs";

export const logsRouter = router({
  userLogs,
  expenseByIdLogs,
  settlementByIdLogs,
});
