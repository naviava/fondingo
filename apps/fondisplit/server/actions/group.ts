"use server";

import splitdb, { GroupType } from "@fondingo/db-split";
import { privateProcedure } from "~/server/trpc";
import { revalidatePath } from "next/cache";
import { TRPCError } from "@trpc/server";
import { z } from "@fondingo/utils/zod";

/**
 * Creates a new group with the provided details.
 *
 * @function
 * @param {Object} ctx - The context object containing the user information.
 * @param {Object} input - The input object containing the group details.
 * @param {string} input.groupName - The name of the group.
 * @param {string} input.color - The color associated with the group.
 * @param {GroupType} input.type - The type of the group.
 * @returns {Promise<Object>} A promise that resolves to an object containing the new group's ID, a toast title, and a toast description.
 * @throws {TRPCError} Will throw an error if the group creation fails.
 */
export const createGroup = privateProcedure
  .input(
    z.object({
      groupName: z
        .string()
        .min(1, { message: "Group name cannot be empty" })
        .max(50, { message: "Group name cannot be longer than 50 characters" }),
      color: z.string().min(1, { message: "Color cannot be empty" }),
      type: z.nativeEnum(GroupType),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { groupName, color, type } = input;

    const group = await splitdb.group.create({
      data: {
        name: groupName,
        color,
        type,
        members: {
          create: {
            userId: user.id,
            name: user.name || user.email,
            email: user.email,
            role: "MANAGER",
          },
        },
      },
    });

    if (!group)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create group. Try again later.",
      });

    revalidatePath("/groups");
    return {
      groupId: group.id,
      toastTitle: `${group.name} created.`,
      toastDescription: "You can now invite members to the group.",
    };
  });

/**
 * Retrieves all groups that the current user is a member of.
 *
 * @function
 * @param {Object} ctx - The context object containing the user information.
 * @returns {Promise<Array>} A promise that resolves to an array of group objects.
 * @throws Will throw an error if the database query fails.
 */
export const getGroups = privateProcedure.query(async ({ ctx }) => {
  const { user } = ctx;
  const groups = await splitdb.group.findMany({
    where: {
      members: {
        some: { userId: user.id },
      },
    },
  });
  return groups || [];
});

/**
 * Retrieves a group by its ID. The group must include the current user as a member.
 *
 * @function
 * @param {Object} ctx - The context object containing the user information.
 * @param {string} groupId - The ID of the group to retrieve. This ID must be a non-empty string.
 * @returns {Promise<Object>} A promise that resolves to the group object. The group object includes its simplified debts and the associated users (both the 'from' and 'to' users).
 * @throws {TRPCError} Will throw a TRPCError with code "NOT_FOUND" and message "Group not found" if no group with the provided ID exists or if the current user is not a member of the group.
 */
export const getGroupById = privateProcedure
  .input(z.string().min(1, { message: "Group ID cannot be empty" }))
  .query(async ({ ctx, input: groupId }) => {
    const { user } = ctx;
    const group = await splitdb.group.findUnique({
      where: {
        id: groupId,
        members: {
          some: { userId: user.id },
        },
      },
      include: {
        members: true,
        expenses: true,
        simplifiedDebts: {
          include: {
            from: true,
            to: true,
          },
        },
      },
    });
    if (!group)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Group not found",
      });
    return group;
  });

/**
 * This function adds a new member to a group. It takes an object as input which includes groupId, memberName, and email.
 * It performs several checks before adding the member:
 * - It checks if the user is trying to add themselves to the group. If so, it throws a TRPCError with a "BAD_REQUEST" code and a message "You cannot add yourself to the group."
 * - It checks if the user is already in the group. If so, it throws a TRPCError with a "BAD_REQUEST" code and a message "User is already in this group."
 * - It checks if the user exists in the database and is a friend. If the user exists but is not a friend, it throws a TRPCError with a "BAD_REQUEST" code and a message "You can add an existing account only if they are your friend."
 *
 * If the user exists and is a friend, they are added to the group.
 * If the user does not exist, they are added to the group and also added as a friend.
 *
 * @function addMember
 * @memberof module:group
 * @param {Object} ctx - The context object, which includes the current user.
 * @param {Object} input - The input object, which includes groupId, memberName, and email.
 * @param {string} input.groupId - The ID of the group to which the member is to be added.
 * @param {string} input.memberName - The name of the member to be added.
 * @param {string} input.email - The email of the member to be added.
 * @returns {Promise<Object>} A promise that resolves to an object containing a toastTitle and toastDescription, which are messages indicating the result of the operation.
 * @throws {TRPCError} Will throw an error if the user tries to add themselves to the group, if the user is already in the group, or if the user exists but is not a friend.
 */
export const addMember = privateProcedure
  .input(
    z.object({
      groupId: z.string().min(1, { message: "Group ID cannot be empty" }),
      memberName: z.string().min(1, { message: "Name cannot be empty" }),
      email: z.string().email({ message: "Invalid email" }),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { groupId, memberName, email } = input;

    // Check if the user is trying to add themselves to the group.
    if (user.email === email)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You cannot add yourself to the group.",
      });

    // Check if the user is already in the group.
    const existingUserInGroup = await splitdb.groupMember.findUnique({
      where: {
        groupId_email: {
          groupId,
          email,
        },
      },
    });
    if (!!existingUserInGroup)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "User is already in this group.",
      });

    // Check if the user exists in the database and is a friend.
    const existingUser = await splitdb.user.findUnique({
      where: { email },
    });

    let isFriend = false;
    if (!!existingUser) {
      const existingUserInFriendsList = await splitdb.friend.findUnique({
        where: {
          userId_email: {
            userId: user.id,
            email,
          },
        },
      });

      // If user exists in the database but is not a friend, throw an error.
      if (!existingUserInFriendsList)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "You can add an existing account only if they are your friend.",
        });
      else {
        isFriend = true;
      }
    }

    // If the user exists and is a friend, add them to the group.
    if (!!existingUser && isFriend) {
      const newGroupMember = await splitdb.groupMember.create({
        data: {
          groupId,
          userId: existingUser.id,
          name: memberName,
          email: existingUser.email,
          role: "MEMBER",
        },
      });
      return {
        toastTitle: `${newGroupMember.name} added to the group.`,
        toastDescription: "You can now split expenses with them.",
      };
    }

    // If the user does not exist, add them to the group, and add them as a friend.
    // TODO: Send an invitation email to the user.
    return splitdb.$transaction(async (db) => {
      const newGroupMember = await db.groupMember.create({
        data: {
          groupId,
          name: memberName,
          email,
          role: "MEMBER",
        },
      });
      const newFriend = await db.friend.create({
        data: {
          name: memberName,
          email,
          userId: user.id,
        },
      });
      return {
        toastTitle: `${newGroupMember.name} added to the group.`,
        toastDescription: `You can now split expenses with them. ${newFriend.email} has been added to your friends list.`,
      };
    });
  });

/**
 * Calculates and stores simplified debts for all users in a specific group.
 *
 * This function performs the following steps:
 * 1. Fetches all expense payments and splits for a specific group from the database.
 * 2. Calculates the net balance for each user in the group by subtracting the amount they paid and adding the amount they owe.
 * 3. Simplifies the debts by repeatedly finding the user who owes the most and the user who is owed the most within the group, and creating a debt from the former to the latter.
 * 4. Stores the simplified debts in the database.
 *
 * @async
 * @function
 * @param {string} groupId - The ID of the group for which to calculate simplified debts.
 * @returns {Promise<{message: string} | void>} A Promise that resolves with a success message when all simplified debts have been stored in the database, or an object with an error message if an error occurred.
 * @throws {Error} Throws an error if there is a problem communicating with the database.
 */
export async function calculateSimplifiedDebts(
  groupId: string,
): Promise<{ message: string } | void> {
  try {
    // Delete exiisting simplified debts for the group
    await splitdb.simplifiedDebt.deleteMany({
      where: { groupId },
    });

    // Calculate net balances.
    const payments = await splitdb.expensePayment.findMany({
      where: {
        expense: { groupId },
      },
      include: { expense: true },
    });
    const splits = await splitdb.expenseSplit.findMany({
      where: {
        expense: { groupId },
      },
      include: { expense: true },
    });

    const balances: { [key: string]: number } = {};
    for (const payment of payments) {
      const paidBy = payment.groupMemberId;
      const amount = payment.amount;

      if (!balances[paidBy]) balances[paidBy] = 0;
      balances[paidBy] += amount;
    }

    for (const split of splits) {
      const owes = split.groupMemberId;
      const amount = split.amount;

      if (!balances[owes]) balances[owes] = 0;
      balances[owes] -= amount;
    }

    // Simplify debts
    const debts: {
      from: string;
      to: string;
      amount: number;
    }[] = [];

    while (Object.keys(balances).length > 0) {
      const maxOwed = Object.keys(balances).reduce((a, b) =>
        balances[a]! > balances[b]! ? a : b,
      );
      const maxOwing = Object.keys(balances).reduce((a, b) =>
        balances[a]! < balances[b]! ? a : b,
      );
      const amount = Math.min(balances[maxOwed]!, -balances[maxOwing]!);

      debts.push({
        from: maxOwing,
        to: maxOwed,
        amount,
      });
      balances[maxOwed]! -= amount;
      balances[maxOwing]! += amount;

      if (balances[maxOwed] === 0) delete balances[maxOwed];
      if (balances[maxOwing] === 0) delete balances[maxOwing];
    }

    // Store simplified debts in the database
    for (const debt of debts) {
      await splitdb.simplifiedDebt.create({
        data: {
          fromId: debt.from,
          toId: debt.to,
          amount: debt.amount,
          groupId,
        },
      });
    }
    return { message: "Simplified debts calculated and stored" };
  } catch (err) {
    console.error("\n\nError calculating simplified debts:\n\n", err);
    return { message: "Error calculating simplified debts" };
  }
}
