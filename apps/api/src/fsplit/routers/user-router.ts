import { router } from "../trpc";

import {
  getAuthProfile,
  declineFriendRequest,
  sendFriendRequest,
  acceptFriendRequest,
  getGrossBalance,
  getFriends,
  getDebtWithFriend,
  findUsers,
  getFriendRequests,
  findFriends,
  editProfile,
  createNewUser,
  changePassword,
  changePreferredCurrency,
} from "../actions/user";

export const userRouter = router({
  acceptFriendRequest,
  changePassword,
  changePreferredCurrency,
  createNewUser,
  declineFriendRequest,
  editProfile,
  findFriends,
  findUsers,
  getAuthProfile,
  getDebtWithFriend,
  getFriends,
  getFriendRequests,
  getGrossBalance,
  sendFriendRequest,
});
