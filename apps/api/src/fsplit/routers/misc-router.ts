import { router } from "../trpc";
import {
  completeVerification,
  contactUs,
  getPasswordResetToken,
  getVerificationToken,
  isVerified,
  resendVerificationEmailByToken,
  resetPassword,
  sendResetPasswordEmail,
} from "../actions/misc";

export const miscRouter = router({
  completeVerification,
  contactUs,
  getPasswordResetToken,
  getVerificationToken,
  isVerified,
  resendVerificationEmailByToken,
  resetPassword,
  sendResetPasswordEmail,
});
