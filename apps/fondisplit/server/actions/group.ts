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
