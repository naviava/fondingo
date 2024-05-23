"use server";

import { getServerSession } from "next-auth";
import { TRPCError } from "@trpc/server";
import { authOptions } from "~/lib/auth";

import { privateProcedure, publicProcedure } from "~/server/trpc";
import splitdb from "@fondingo/db-split";
import { z } from "@fondingo/utils/zod";

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

    const existingFriend = await splitdb.friend.findFirst({
      where: {
        OR: [
          {
            user1Id: user.id,
            user2: { email: email },
          },
          {
            user1: { email: email },
            user2Id: user.id,
          },
        ],
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

/**
 * This function accepts a friend request by creating a new friendship and deleting the friend request.
 * It is a private procedure that requires the user to be authenticated.
 *
 * @function acceptFriendRequest
 * @param {string} friendReqId - The ID of the friend request to be accepted. It must be a non-empty string.
 * @returns {Promise<Object>} A promise that resolves to an object containing a success message and the names of the new friends.
 *
 * @throws {TRPCError} Will throw an error if the friend request ID is not found.
 * @throws {TRPCError} Will throw an error if the user is not authorized to accept the friend request.
 * @throws {TRPCError} Will throw an error if the creation of the friend fails.
 * @throws {TRPCError} Will throw an error if the deletion of the friend request fails.
 */
export const acceptFriendRequest = privateProcedure
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
        message: "You are not authorized to accept this friend request.",
      });

    return splitdb.$transaction(async (db) => {
      const friend = await db.friend.create({
        data: {
          user1Id: friendRequest.fromId,
          user2Id: friendRequest.toId,
        },
        include: {
          user1: {
            select: { name: true },
          },
          user2: {
            select: { name: true },
          },
        },
      });
      if (!friend)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create friend.",
        });

      const deletedFriendRequest = await db.friendRequest.delete({
        where: { id: friendReqId },
      });
      if (!deletedFriendRequest)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete friend request.",
        });

      return {
        toastTitle: "Friend request has been accepted.",
        toastDescription: `${friend.user1.name} and ${friend.user2.name} are now friends`,
      };
    });
  });

export const getFriends = privateProcedure.query(async ({ ctx }) => {
  const { user } = ctx;
  const friends = await splitdb.friend.findMany({
    where: {
      OR: [{ user1Id: user.id }, { user2Id: user.id }],
    },
    include: {
      user1: true,
      user2: true,
    },
  });
  const formattedFriends = friends.map((friend) =>
    friend.user1Id === user.id ? friend.user2 : friend.user1,
  );

  const tempFriends = await splitdb.tempFriend.findMany({
    where: { userId: user.id },
  });

  return {
    friends: !!formattedFriends.length ? formattedFriends : [],
    tempFriends: !!tempFriends.length ? tempFriends : [],
  };
});

/**
 * This function is an asynchronous operation that calculates and returns the gross balance of a user.
 * The gross balance is calculated as the difference between the total amount of credits and the total amount of debts of the user.
 *
 * The function is exported as a `privateProcedure.query` which means it's a private method that can be queried.
 *
 * The function takes an object as an argument which contains a `ctx` property. The `ctx` property is an object that contains the `user` object.
 * The `user` object is expected to have an `id` property which is used to query the database for the user's debts and credits.
 *
 * The function queries the `splitdb.simplifiedDebt` table twice:
 * 1. First, it finds all the debts where the user is the debtor (`from: { userId: user.id }`).
 * 2. Then, it finds all the credits where the user is the creditor (`to: { userId: user.id }`).
 *
 * After retrieving the debts and credits, it calculates the total amount of debts and credits by reducing the arrays of debts and credits.
 * The `reduce` function is used to sum up the `amount` property of each debt and credit.
 *
 * The function then returns the difference between the total credit amount and the total debt amount which represents the user's gross balance.
 *
 * If any error occurs during the execution of the function, it logs the error to the console and throws a new `TRPCError` with the code "INTERNAL_SERVER_ERROR" and a message "Failed to get gross balance."
 *
 * @async
 * @function getGrossBalance
 * @param {Object} arg - The argument object.
 * @param {Object} arg.ctx - The context object.
 * @param {Object} arg.ctx.user - The user object.
 * @param {string} arg.ctx.user.id - The ID of the user.
 * @returns {Promise<number>} The gross balance of the user.
 * @throws {TRPCError} Will throw an error if the operation fails.
 */
export const getGrossBalance = privateProcedure.query(async ({ ctx }) => {
  const { user } = ctx;

  try {
    const debts = await splitdb.simplifiedDebt.findMany({
      where: {
        from: { userId: user.id },
      },
      include: { group: true },
    });
    const credits = await splitdb.simplifiedDebt.findMany({
      where: {
        to: { userId: user.id },
      },
      include: { group: true },
    });
    const debtAmount = debts.reduce((acc, debt) => acc + debt.amount, 0);
    const creditAmount = credits.reduce(
      (acc, credit) => acc + credit.amount,
      0,
    );
    return creditAmount - debtAmount;
  } catch (err) {
    console.error(err);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get gross balance.",
    });
  }
});

/**
 * This function is a private procedure that calculates the debt between the current user and a friend.
 * It takes a friend's ID as input and returns an object containing information about the debt.
 *
 * @function getDebtWithFriend
 * @memberof module:splitdb
 * @param {string} friendId - The ID of the friend with whom the debt is to be calculated. It must be a non-empty string.
 * @returns {Promise<Object>} A promise that resolves to an object containing the following properties:
 * @property {boolean} isInDebt - A boolean indicating whether the current user is in debt to the friend.
 * @property {string|null} displayAmountText - A string representing the amount of debt in a displayable format. If there is no debt, this property is null.
 * @property {number} amount - The total amount of debt. It is a positive number if the user owes the friend, and a negative number if the friend owes the user.
 *
 * @throws {TRPCError} Throws a TRPCError with code "INTERNAL_SERVER_ERROR" if there is an error during the execution of the function.
 *
 * @description
 * The function first checks if the friend exists in the database. If the friend does not exist, it returns an object indicating that there is no debt.
 * If the friend exists, it fetches all the credit and debt records between the user and the friend.
 * It then calculates the total credit and debt amounts, and the balance amount (credit - debt).
 * If the balance amount is positive, it means the user owes the friend. If it's negative, the friend owes the user.
 * The function then returns an object containing the debt information.
 */
export const getDebtWithFriend = privateProcedure
  .input(z.string().min(1, { message: "Friend ID cannot be empty" }))
  .query(async ({ ctx, input: friendId }) => {
    const { user } = ctx;

    try {
      const existingFriend = await splitdb.user.findUnique({
        where: { id: friendId },
      });
      if (!existingFriend)
        return {
          isInDebt: false,
          displayAmountText: null,
          amount: 0,
        };

      const credits = await splitdb.simplifiedDebt.findMany({
        where: {
          from: { userId: existingFriend.id },
          to: { userId: user.id },
        },
      });
      const debts = await splitdb.simplifiedDebt.findMany({
        where: {
          from: { userId: user.id },
          to: { userId: existingFriend.id },
        },
      });

      const creditAmount = credits.reduce(
        (acc, credit) => acc + credit.amount,
        0,
      );
      const debtAmount = debts.reduce((acc, debt) => acc + debt.amount, 0);
      const balanceAmount = creditAmount - debtAmount;

      const isInDebt = debtAmount > creditAmount;
      const displayAmountText =
        balanceAmount > 0
          ? (balanceAmount / 100).toFixed(2)
          : ((balanceAmount / 100) * -1).toFixed(2);

      return {
        isInDebt,
        displayAmountText,
        amount: balanceAmount,
      };
    } catch (err) {
      console.error(err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get debt with friend.",
      });
    }
  });

export async function mergeUserAccounts() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    return null;
  }

  const existingUser = await splitdb.user.findUnique({
    where: {
      email: session.user.email,
      isMerged: false,
    },
  });
  if (!existingUser) return null;

  return splitdb.$transaction(async (db) => {
    await db.groupMember.updateMany({
      where: {
        email: existingUser.email,
        userId: null,
      },
      data: { userId: existingUser.id },
    });

    const tempFriends = await db.tempFriend.findMany({
      where: {
        email: existingUser.email,
      },
    });

    if (!!tempFriends.length) {
      await db.friend.createMany({
        data: tempFriends.map((tempFriend) => ({
          user1Id: tempFriend.userId,
          user2Id: existingUser.id,
        })),
      });

      await db.tempFriend.deleteMany({
        where: { email: existingUser.email },
      });
    }

    await db.user.update({
      where: { id: existingUser.id },
      data: { isMerged: true },
    });
  });
}
