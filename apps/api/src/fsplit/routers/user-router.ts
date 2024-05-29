import { router } from "../trpc";

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
  findFriends,
  editProfile,
} from "../actions/user";

export const userRouter = router({
  getAuthProfile,
  editProfile,
  sendFriendRequest,
  getFriendRequests,
  declineFriendRequest,
  acceptFriendRequest,
  getGrossBalance,
  getFriends,
  getDebtWithFriend,
  findUsers,
  findFriends,
});
