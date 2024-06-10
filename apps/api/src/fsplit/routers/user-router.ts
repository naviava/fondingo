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
  resendVerificationEmailByToken,
  completeVerification,
  isVerified,
  getVerificationToken,
  sendResetPasswordEmail,
  getPasswordResetToken,
} from "../actions/user";

export const userRouter = router({
  getAuthProfile,
  getFriends,
  getFriendRequests,
  getGrossBalance,
  getDebtWithFriend,
  acceptFriendRequest,
  createNewUser,
  changePassword,
  changePreferredCurrency,
  declineFriendRequest,
  editProfile,
  findFriends,
  findUsers,
  sendFriendRequest,
  resendVerificationEmailByToken,
  completeVerification,
  isVerified,
  getVerificationToken,
  sendResetPasswordEmail,
  getPasswordResetToken,
});
