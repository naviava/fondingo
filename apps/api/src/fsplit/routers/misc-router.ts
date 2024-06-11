import { router } from "../trpc";
import {
  completeVerification,
  contactUs,
  getPasswordResetToken,
  getVerificationToken,
  isVerified,
  sendResetPasswordEmail,
  resendVerificationEmailByEmail,
  resendVerificationEmailByToken,
  resetPassword,
} from "../actions/misc";

export const miscRouter = router({
  completeVerification,
  contactUs,
  getPasswordResetToken,
  getVerificationToken,
  isVerified,
  sendResetPasswordEmail,
  resendVerificationEmailByEmail,
  resendVerificationEmailByToken,
  resetPassword,
});
