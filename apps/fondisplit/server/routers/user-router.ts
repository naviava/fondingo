import { router } from "~/server/trpc";

import {
  declineFriendRequest,
  sendFriendRequest,
  getAuthProfile,
} from "../actions/user";

export const userRouter = router({
  getAuthProfile,
  sendFriendRequest,
  declineFriendRequest,
});
