import { router } from "../trpc";
import {
  completeVerification,
  contactUs,
  getInviteByEmail,
  getPasswordResetToken,
  getVerificationToken,
  isVerified,
  sendInvitation,
  sendResetPasswordEmail,
  resendVerificationEmailByEmail,
  resendVerificationEmailByToken,
  resetPassword,
} from "../actions/misc";

export const miscRouter = router({
  completeVerification,
  contactUs,
  getInviteByEmail,
  getPasswordResetToken,
  getVerificationToken,
  isVerified,
  sendInvitation,
  sendResetPasswordEmail,
  resendVerificationEmailByEmail,
  resendVerificationEmailByToken,
  resetPassword,
});
