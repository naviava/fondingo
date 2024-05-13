"use server";

import splitdb from "@fondingo/db-split";
import { z } from "@fondingo/utils/zod";
import { TRPCError } from "@trpc/server";
import { getServerSession } from "next-auth";
import { privateProcedure, publicProcedure } from "~/server/trpc";

/**
 * This function is a public procedure that queries for an authenticated user's profile.
 * It first retrieves the server session and checks if a user with an email exists in the session.
 * If not, it returns null.
 * If a user exists, it queries the database for a user with the matching email.
 * If no user is found in the database, it returns null.
 * If a user is found, it removes the hashed password from the user object and returns the user object.
 *
 * @returns {Promise<object|null>} A Promise that resolves to the user object without the hashed password, or null if no user is found.
 */
export const getAuthProfile = publicProcedure.query(async () => {
  const session = await getServerSession();
  if (!session || !session.user || !session.user.email) {
    return null;
  }

  const user = await splitdb.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return null;
  // eslint-disable-next-line no-unused-vars
  const { hashedPassword, ...userWithoutPassword } = user;

  return userWithoutPassword;
});

/**
 * This function is used to send a friend request in the application.
 * It is a private procedure that takes an email string input representing the recipient of the friend request.
 * The email should be valid, otherwise an error message is thrown.
 *
 * @function sendFriendRequest
 * @param {Object} ctx - The context object containing the user information.
 * @param {string} email - The email of the user to whom the friend request will be sent.
 * @throws {TRPCError} Will throw an error if the user tries to send a friend request to themselves.
 * @throws {TRPCError} Will throw an error if the user with the provided email does not exist.
 * @throws {TRPCError} Will throw an error if the user is already a friend.
 * @throws {TRPCError} Will throw an error if a friend request already exists between the two users.
 * @throws {TRPCError} Will throw an error if the friend request could not be created due to a server error.
 * @returns {Promise<Object>} A Promise that resolves with a toast message when the friend request has been successfully sent.
 */
export const sendFriendRequest = privateProcedure
  .input(z.string().email({ message: "Invalid email" }))
  .mutation(async ({ ctx, input: email }) => {
    const { user } = ctx;
    if (user.email === email)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You cannot send a friend request to yourself.",
      });

    const existingUser = await splitdb.user.findUnique({
      where: { email: email },
    });
    if (!existingUser)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "User with that email does not exist.",
      });

    const existingFriend = await splitdb.friend.findUnique({
      where: {
        userId_email: {
          userId: user.id,
          email: existingUser.email,
        },
      },
    });
    if (!!existingFriend)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User is already your friend.",
      });

    const existingFriendRequest = await splitdb.friendRequest.findFirst({
      where: {
        OR: [
          {
            fromId: user.id,
            toId: existingUser.id,
          },
          {
            fromId: existingUser.id,
            toId: user.id,
          },
        ],
      },
    });
    if (!!existingFriendRequest)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Friend request already already exists.",
      });

    const friendRequest = await splitdb.friendRequest.create({
      data: {
        fromId: user.id,
        toId: existingUser.id,
      },
    });
    if (!friendRequest)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to send friend request.",
      });

    return {
      toastTitle: "Friend request sent",
      toastDescription: `Friend request has been sent to ${email}.`,
    };
  });

/**
 * This function is used to decline a friend request in the application.
 * It is a private procedure that takes a string input representing the friend request ID.
 * The ID should be at least 1 character long, otherwise an error message is thrown.
 *
 * @function declineFriendRequest
 * @param {Object} ctx - The context object containing the user information.
 * @param {string} friendReqId - The ID of the friend request to be declined.
 * @throws {TRPCError} Will throw an error if the friend request is not found.
 * @throws {TRPCError} Will throw an error if the user is not authorized to decline the friend request.
 * @throws {TRPCError} Will throw an error if the friend request could not be deleted due to a server error.
 * @returns {Promise<Object>} A Promise that resolves with a toast message when the friend request has been successfully deleted.
 */
export const declineFriendRequest = privateProcedure
  .input(z.string().min(1, { message: "Friend request ID cannot be empty" }))
  .mutation(async ({ ctx, input: friendReqId }) => {
    const { user } = ctx;
    const friendRequest = await splitdb.friendRequest.findUnique({
      where: { id: friendReqId },
    });
    if (!friendRequest)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Friend request not found.",
      });
    if (friendRequest.toId !== user.id && friendRequest.fromId !== user.id)
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not authorized to decline this friend request.",
      });

    const deletedFriendRequest = await splitdb.friendRequest.delete({
      where: { id: friendReqId },
    });
    if (!deletedFriendRequest)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete friend request.",
      });

    return {
      toastTitle: "Friend request removed",
      toastDescription: "Friend request has been successfully deleted.",
    };
  });

export const acceptFriendRequest = privateProcedure
  .input(z.string().min(1, { message: "Friend request ID cannot be empty" }))
  .mutation(async ({ ctx, input: friendReqId }) => {
    const { user } = ctx;
    const friendRequest = await splitdb.friendRequest.findUnique({
      where: { id: friendReqId },
      include: { from: true },
    });
    if (!friendRequest)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Friend request not found.",
      });
    if (friendRequest.toId !== user.id && friendRequest.fromId !== user.id)
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "You are not authorized to decline this friend request.",
      });

    return splitdb.$transaction(async (db) => {});
  });
