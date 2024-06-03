import { router } from "../trpc";

import { userLogs } from "../actions/logs";

export const logsRouter = router({
  userLogs,
});
