import { router } from "~/server/trpc";

import {
  declineFriendRequest,
  sendFriendRequest,
  getAuthProfile,
  acceptFriendRequest,
  getGrossBalance,
  getFriends,
  getDebtWithFriend,
  findUsers,
  getFriendRequests,
} from "../actions/user";

export const userRouter = router({
  getAuthProfile,
  sendFriendRequest,
  getFriendRequests,
  declineFriendRequest,
  acceptFriendRequest,
  getGrossBalance,
  getFriends,
  getDebtWithFriend,
  findUsers,
});
