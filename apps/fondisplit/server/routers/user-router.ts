import { router } from "~/server/trpc";

import { getAuthProfile } from "../actions/user";

export const userRouter = router({
  getAuthProfile,
});
