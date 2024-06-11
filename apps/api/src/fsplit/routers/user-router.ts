import { router } from "../trpc";

import {
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
