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
} from "../actions/user";

export const userRouter = router({
  getAuthProfile,
  sendFriendRequest,
  declineFriendRequest,
  acceptFriendRequest,
  getGrossBalance,
  getFriends,
  getDebtWithFriend,
  findUsers,
});
