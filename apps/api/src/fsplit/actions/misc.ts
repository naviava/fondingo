import { privateProcedure, publicProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import splitdb from "@fondingo/db-split";
import { z } from "@fondingo/utils/zod";
import { hash } from "bcrypt";
import { sendPasswordResetEmail, sendVerificationEmail } from "../../utils";
import { uuid } from "@fondingo/utils/uuid";

export const contactUs = publicProcedure
  .input(
    z.object({
      fullName: z
        .string()
        .min(1, { message: "Cannot be empty" })
        .max(50, { message: "Too long" }),
      email: z.string().email({ message: "Invalid email address" }),
      message: z
        .string()
        .min(10, { message: "Too short" })
        .max(5000, { message: "Too long" }),
    }),
  )
  .mutation(async ({ input }) => {
    const email = input.email.toLowerCase();
    const { fullName, message } = input;

    const sentMessage = await splitdb.contactForm.create({
      data: {
        name: fullName,
        email,
        message,
      },
    });
    if (!sentMessage)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send message",
      });

    return {
      toastTitle: "Message sent",
      toastDescription: "We'll get back to you soon!",
    };
  });

export const resendVerificationEmailByToken = publicProcedure
  .input(z.string().min(1, { message: "Token cannot be empty." }))
  .mutation(async ({ input: token }) => {
    const existingToken = await splitdb.confirmEmailToken.findUnique({
      where: { token },
      include: { user: true },
    });
    if (!existingToken)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "No verification token found.",
      });

    if (Date.now() - new Date(existingToken.createdAt).getTime() < 90 * 1000)
      return {
        toastTitle: "Verification email sent",
        toastDescription: `Email has been sent to ${existingToken.user.email} less than 90 seconds back.`,
        createdAt: existingToken.createdAt,
      };

    return splitdb.$transaction(async (db) => {
      const deletedToken = await db.confirmEmailToken.delete({
        where: { id: existingToken.id },
      });
      if (!deletedToken)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete token. Email not sent.",
        });

      const newToken = await db.confirmEmailToken.create({
        data: {
          token: uuid(),
          userId: existingToken.user.id,
          expires: new Date(Date.now() + 1000 * 60 * 15),
        },
      });
      const sent = await sendVerificationEmail({
        email: existingToken.user.email,
        token: newToken.token,
        pathname: "/verify",
      });
      if (!sent)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send email.",
        });
      return {
        toastTitle: "Verification email sent",
        toastDescription: `Email has been sent to ${existingToken.user.email}.`,
        createdAt: newToken.createdAt,
      };
    });
  });

export const resendVerificationEmailByEmail = publicProcedure
  .input(z.string().email({ message: "Email is invalid" }))
  .mutation(async ({ input }) => {
    const email = input.toLowerCase();
    const existingUser = await splitdb.user.findUnique({
      where: { email },
      include: { accountVerification: true },
    });
    if (!existingUser)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No user found with that email.",
      });
    if (!!existingUser.accountVerification)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User is already verified.",
      });

    const existingToken = await splitdb.confirmEmailToken.findFirst({
      where: { userId: existingUser.id },
      include: {
        user: {
          select: { email: true },
        },
      },
    });
    if (
      !!existingToken &&
      Date.now() - new Date(existingToken.createdAt || "").getTime() < 90 * 1000
    )
      return {
        toastTitle: "Verification email sent",
        toastDescription: `Email has been sent to ${existingUser.email} less than 90 seconds back.`,
        createdAt: existingToken.createdAt,
      };

    return splitdb.$transaction(async (db) => {
      if (!!existingToken) {
        const deletedToken = await db.confirmEmailToken.delete({
          where: { id: existingToken?.id },
        });
        if (!deletedToken)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to delete token. Email not sent.",
          });
      }

      const newToken = await db.confirmEmailToken.create({
        data: {
          token: uuid(),
          userId: existingUser.id,
          expires: new Date(Date.now() + 1000 * 60 * 15),
        },
      });
      const sent = await sendVerificationEmail({
        email: existingUser.email,
        token: newToken.token,
        pathname: "/verify",
      });
      if (!sent)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send email.",
        });
      return {
        toastTitle: "Verification email sent",
        toastDescription: `Email has been sent to ${existingUser.email}.`,
        createdAt: newToken.createdAt,
      };
    });
  });

export const getVerificationToken = publicProcedure
  .input(z.string().min(1, { message: "Token cannot be empty." }))
  .query(async ({ input: token }) => {
    const existingToken = await splitdb.confirmEmailToken.findUnique({
      where: { token },
    });

    return existingToken;
  });

export const completeVerification = publicProcedure
  .input(z.string().min(1, { message: "Token cannot be empty." }))
  .mutation(async ({ input: token }) => {
    return splitdb.$transaction(async (db) => {
      const existingToken = await db.confirmEmailToken.findUnique({
        where: { token },
      });
      if (!existingToken)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No verification token found.",
        });
      if (Date.now() > new Date(existingToken.expires).getTime())
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Verification token has expired.",
        });

      const completedVerification = await db.accountVerification.create({
        data: { userId: existingToken.userId },
      });
      if (!completedVerification)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to complete verification.",
        });

      const deletedToken = await db.confirmEmailToken.delete({
        where: { id: existingToken.id },
      });
      if (!deletedToken)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete token.",
        });

      return true;
    });
  });

export const isVerified = privateProcedure
  .input(z.string().email({ message: "Invalid email" }))
  .query(async ({ input: email }) => {
    const existingUser = await splitdb.user.findUnique({
      where: { email },
      include: { accountVerification: true },
    });
    if (!existingUser)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User not found.",
      });

    const isVerified = !!existingUser.accountVerification;
    return isVerified;
  });

export const sendResetPasswordEmail = publicProcedure
  .input(z.string().email({ message: "Invalid email" }))
  .mutation(async ({ input }) => {
    const email = input.toLowerCase();
    const existingUser = await splitdb.user.findUnique({
      where: { email },
    });
    if (!existingUser)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "That email is not registered with us.",
      });

    return splitdb.$transaction(async (db) => {
      const existingPasswordResetToken = await db.passwordResetToken.findFirst({
        where: { userEmail: existingUser.email },
      });
      if (
        !!existingPasswordResetToken &&
        Date.now() < existingPasswordResetToken.expires.getTime()
      )
        return {
          toastTitle: "Reset email sent",
          toastDescription: `Email has been sent to ${existingUser.email} less than 15 minutes back. Please check your mailbox.`,
        };
      if (!!existingPasswordResetToken)
        await db.passwordResetToken.delete({
          where: { id: existingPasswordResetToken.id },
        });

      const newToken = await db.passwordResetToken.create({
        data: {
          token: uuid(),
          email: existingUser.email,
          userEmail: existingUser.email,
          expires: new Date(Date.now() + 1000 * 60 * 15),
        },
      });
      const sent = await sendPasswordResetEmail({
        email: existingUser.email,
        token: newToken.token,
        pathname: "/reset-password",
      });
      if (!sent)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to send email. Password reset request failed.",
        });

      return {
        toastTitle: "Password reset intructions sent.",
        toastDescription: `Email has been sent to ${existingUser.email}. Please check your mailbox.`,
      };
    });
  });

export const getPasswordResetToken = publicProcedure
  .input(z.string().min(1, { message: "Token cannot be empty." }))
  .query(async ({ input: token }) => {
    const existingToken = await splitdb.passwordResetToken.findUnique({
      where: { token },
      include: {
        user: {
          select: { name: true },
        },
      },
    });
    return existingToken;
  });

export const resetPassword = publicProcedure
  .input(
    z.object({
      token: z.string().min(1, { message: "Token cannot be empty." }),
      email: z.string().email({ message: "Invalid email" }),
      password: z.string().min(6, { message: "Password too short" }),
      confirmPassword: z
        .string()
        .min(6, { message: "Confirm password too short" }),
    }),
  )
  .mutation(async ({ input }) => {
    const email = input.email.toLowerCase();
    const { token, password, confirmPassword } = input;
    if (password !== confirmPassword)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Passwords do not match.",
      });

    const existingToken = await splitdb.passwordResetToken.findUnique({
      where: { token, email },
    });
    if (!existingToken)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Token for that email, not found.",
      });
    if (Date.now() > existingToken.expires.getTime())
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Token has expired.",
      });

    return splitdb.$transaction(async (db) => {
      const hashedPassword = await hash(password, 10);
      const updatedUser = await db.user.update({
        where: { email },
        data: { hashedPassword },
      });
      if (!updatedUser)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update password.",
        });

      const deletedToken = await db.passwordResetToken.delete({
        where: { id: existingToken.id },
      });
      if (!deletedToken)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete token. Password reset failed.",
        });

      return {
        toastTitle: `Password reset for ${updatedUser.name}`,
        toastDescription: "You can now login with your new password.",
      };
    });
  });
