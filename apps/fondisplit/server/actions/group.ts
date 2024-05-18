"use server";

import splitdb, { GroupType } from "@fondingo/db-split";
import { privateProcedure } from "~/server/trpc";
import { revalidatePath } from "next/cache";
import { TRPCError } from "@trpc/server";
import { z } from "@fondingo/utils/zod";
import { hasDuplicates } from "~/lib/utils";

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
 * This function is used to add a member to a group. It takes an input object with the following properties:
 * - groupId: A string representing the ID of the group to which the member is to be added. It cannot be empty.
 * - memberName: A string representing the name of the member to be added. It cannot be empty.
 * - email: A string representing the email of the member to be added. It must be a valid email format.
 *
 * The function performs the following checks:
 * - It checks if the user is trying to add themselves to the group. If so, it throws a TRPCError with a "BAD_REQUEST" code and a message stating "You cannot add yourself to the group."
 * - It checks if the user is already in the group. If so, it throws a TRPCError with a "BAD_REQUEST" code and a message stating "User is already in this group."
 * - It checks if the user exists in the database and is a friend. If the user exists but is not a friend, it throws a TRPCError with a "BAD_REQUEST" code and a message stating "You can add an existing account only if they are your friend."
 *
 * If the user exists and is a friend, the function adds them to the group and returns an object with a toastTitle and toastDescription.
 *
 * If the user does not exist, the function adds them to the group, adds them as a temp friend, and returns an object with a toastTitle and toastDescription. It also has a TODO to send an invitation email to the user.
 *
 * @function addMember
 * @param {Object} input - The input object containing the groupId, memberName, and email.
 * @param {string} input.groupId - The ID of the group to which the member is to be added.
 * @param {string} input.memberName - The name of the member to be added.
 * @param {string} input.email - The email of the member to be added.
 * @returns {Promise<Object>} Returns a promise that resolves to an object with a toastTitle and toastDescription.
 * @throws {TRPCError} Throws a TRPCError if the user is trying to add themselves to the group, if the user is already in the group, or if the user exists but is not a friend.
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
      const existingUserInFriendsList = await splitdb.friend.findFirst({
        where: {
          OR: [
            {
              user1Id: user.id,
              user2Id: existingUser.id,
            },
            {
              user1Id: existingUser.id,
              user2Id: user.id,
            },
          ],
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
          name: memberName,
          email: existingUser.email,
          userId: existingUser.id,
          role: "MEMBER",
        },
      });
      return {
        toastTitle: `${newGroupMember.name} added to the group.`,
        toastDescription: "You can now split expenses with them.",
      };
    }

    // If the user does not exist, add them to the group, and add them as a temp friend.
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

      const existingTempFriend = await db.tempFriend.findUnique({
        where: {
          userId_email: {
            userId: user.id,
            email,
          },
        },
      });
      if (!!existingTempFriend)
        return {
          toastTitle: `${newGroupMember.name} added to the group.`,
          toastDescription: `You can now split expenses with them.`,
        };

      const newTempFriend = await db.tempFriend.create({
        data: {
          name: memberName,
          email,
          userId: user.id,
        },
      });
      return {
        toastTitle: `${newGroupMember.name} added to the group.`,
        toastDescription: `You can now split expenses with them. ${newTempFriend.email} has been added to your friends list.`,
      };
    });
  });

/**
 * This function is a private procedure that retrieves the members of a group.
 * It takes a group ID as input and returns the members of the group.
 *
 * @function getMembers
 * @memberof module:group
 * @public
 * @param {string} groupId - The ID of the group. It must be a non-empty string.
 * @throws {TRPCError} Will throw an error if the group ID is not found or the user is not a member of the group.
 * @returns {Promise<Array<GroupMember>>} Returns a promise that resolves to an array of group members. Each group member is an object that includes the user details.
 *
 * @description
 * The function first checks if the user is a member of the group with the provided ID. If the user is not a member or the group does not exist, it throws a TRPCError with a "NOT_FOUND" code.
 * If the user is a member of the group, the function retrieves the members of the group from the database and returns them.
 * The function uses the `splitdb.group.findUnique` method to check if the user is a member of the group and the `splitdb.groupMember.findMany` method to retrieve the group members.
 */
export const getMembers = privateProcedure
  .input(z.string().min(1, { message: "Group ID cannot be empty" }))
  .query(({ ctx, input: groupId }) => {
    const { user } = ctx;
    const isInGroup = splitdb.group.findUnique({
      where: {
        id: groupId,
        members: {
          some: { userId: user.id },
        },
      },
    });
    if (!isInGroup)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Group not found",
      });

    const groupMembers = splitdb.groupMember.findMany({
      where: { groupId },
      include: { user: true },
    });
    return groupMembers;
  });

export const addExpense = privateProcedure
  .input(
    z.object({
      groupId: z.string().min(1, { message: "Group ID is required" }),
      expenseName: z.string().min(1, { message: "Expense name is required" }),
      expenseAmount: z.number(),
      payments: z.array(
        z.object({
          userId: z.string().min(1),
          amount: z.number(),
        }),
      ),
      splits: z.array(
        z.object({
          userId: z.string().min(1),
          amount: z.number(),
        }),
      ),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { groupId, expenseName, expenseAmount, payments, splits } = input;

    const group = await splitdb.group.findUnique({
      where: {
        id: groupId,
        members: {
          some: { userId: user.id },
        },
      },
    });
    if (!group)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Group not found",
      });

    const totalPaymentsAmount = payments.reduce(
      (acc, payment) => acc + payment.amount,
      0,
    );
    const totalSplitsAmount = splits.reduce(
      (acc, split) => acc + split.amount,
      0,
    );
    if (
      totalPaymentsAmount !== expenseAmount ||
      totalSplitsAmount !== expenseAmount
    ) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Total payments and splits should match the expense amount",
      });
    }

    if (expenseAmount <= 1)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message:
          "Don't be cheap. Expense amount should be greater than or equal to 1",
      });

    const groupMembers = await splitdb.groupMember.findMany({
      where: { groupId },
    });
    const groupMemberIds = groupMembers.map((member) => member.userId);

    const paymentUserIds = payments.map((payment) => payment.userId);
    if (hasDuplicates(paymentUserIds)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Duplicate users in payments",
      });
    }
    payments.forEach((payment) => {
      if (payment.amount <= 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment amount should be greater than 0",
        });
      if (!groupMemberIds.includes(payment.userId))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Payment user not in group",
        });
    });

    const splitUserIds = splits.map((split) => split.userId);
    if (hasDuplicates(splitUserIds)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Duplicate users in splits",
      });
    }
    splits.forEach((split) => {
      if (split.amount <= 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Split amount should be greater than 0",
        });
      if (!groupMemberIds.includes(split.userId))
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Split user not in group",
        });
    });

    try {
      return splitdb.$transaction(async (db) => {
        const expense = await db.expense.create({
          data: {
            name: expenseName,
            amount: Math.floor(expenseAmount * 100),
            createdById: user.id,
            groupId,
          },
        });
        if (!expense)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create expense",
          });

        for (const payment of payments) {
          const expensePayment = await db.expensePayment.create({
            data: {
              amount: Math.floor(payment.amount * 100),
              groupMemberId: payment.userId,
              expenseId: expense.id,
            },
          });
          if (!expensePayment)
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create payment",
            });
        }

        for (const split of splits) {
          const expenseSplit = await db.expenseSplit.create({
            data: {
              amount: Math.floor(split.amount * 100),
              groupMemberId: split.userId,
              expenseId: expense.id,
            },
          });
          if (!expenseSplit)
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create split",
            });
        }

        const res = await calculateDebts(groupId);
        if (!("success" in res) || !res.success) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to calculate debts",
          });
        }
        return {
          toastTitle: `${expense.name} added"`,
          toastDescription: `Expense of ${expense.amount} added to the group`,
        };
      });
    } catch (err) {
      console.error("\n\nError adding expense:\n\n", err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to add expense",
      });
    }
  });

/**
 * This function calculates and stores the simplified debts for a given group.
 *
 * It first deletes any existing simplified debts for the group. Then it calculates the net balances
 * by fetching all payments and splits related to the group. It also fetches any settlement entries
 * for the group.
 *
 * The function then calculates the balances for each group member by adding the amounts they have paid
 * and subtracting the amounts they owe. It also subtracts any settled amounts from the balances.
 *
 * After calculating the balances, the function simplifies the debts. It finds the group member who owes
 * the most and the group member who is owed the most, and creates a debt from the former to the latter.
 * The amount of the debt is the lesser of the amount owed by the former and the amount owed to the latter.
 * This process is repeated until all debts are simplified.
 *
 * Finally, the simplified debts are stored in the database and a success message is returned. If any error
 * occurs during the process, an error message is returned.
 *
 * @param {string} groupId - The ID of the group for which to calculate and store simplified debts.
 * @returns {Promise<{ message: string } | void>} - A promise that resolves to an object containing a success
 * or error message, or resolves to undefined if no group with the given ID exists.
 *
 * @throws {Error} - Throws an error if there is a problem with the database transaction or if any other
 * unexpected error occurs.
 *
 * @async
 */
export async function calculateDebts(
  groupId: string,
): Promise<{ success: string } | { error: string }> {
  try {
    return splitdb.$transaction(async (db) => {
      // Delete existing simplified debts for the group
      await db.simplifiedDebt.deleteMany({
        where: { groupId },
      });

      // Calculate net balances.
      const payments = await db.expensePayment.findMany({
        where: {
          expense: { groupId },
        },
        include: { expense: true },
      });
      const splits = await db.expenseSplit.findMany({
        where: {
          expense: { groupId },
        },
        include: { expense: true },
      });

      // Fetch settlement entries
      const settlements = await db.settlement.findMany({
        where: {
          groupId,
        },
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

      // Subtract settled amounts from balances
      for (const settlement of settlements) {
        const paidBy = settlement.toId;
        const amount = settlement.amount;

        if (!balances[paidBy]) balances[paidBy] = 0;
        balances[paidBy] -= amount;
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
        await db.simplifiedDebt.create({
          data: {
            fromId: debt.from,
            toId: debt.to,
            amount: debt.amount,
            groupId,
          },
        });
      }
      return { success: "Simplified debts calculated and stored" };
    });
  } catch (err) {
    console.error("\n\nError calculating simplified debts:\n\n", err);
    return { error: "Error calculating simplified debts" };
  }
}

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
// export async function calculateSimplifiedDebts(
//   groupId: string,
// ): Promise<{ message: string } | void> {
//   try {
//     // Delete exiisting simplified debts for the group
//     await splitdb.simplifiedDebt.deleteMany({
//       where: { groupId },
//     });

//     // Calculate net balances.
//     const payments = await splitdb.expensePayment.findMany({
//       where: {
//         expense: { groupId },
//       },
//       include: { expense: true },
//     });
//     const splits = await splitdb.expenseSplit.findMany({
//       where: {
//         expense: { groupId },
//       },
//       include: { expense: true },
//     });

//     const balances: { [key: string]: number } = {};
//     for (const payment of payments) {
//       const paidBy = payment.groupMemberId;
//       const amount = payment.amount;

//       if (!balances[paidBy]) balances[paidBy] = 0;
//       balances[paidBy] += amount;
//     }

//     for (const split of splits) {
//       const owes = split.groupMemberId;
//       const amount = split.amount;

//       if (!balances[owes]) balances[owes] = 0;
//       balances[owes] -= amount;
//     }

//     // Simplify debts
//     const debts: {
//       from: string;
//       to: string;
//       amount: number;
//     }[] = [];

//     while (Object.keys(balances).length > 0) {
//       const maxOwed = Object.keys(balances).reduce((a, b) =>
//         balances[a]! > balances[b]! ? a : b,
//       );
//       const maxOwing = Object.keys(balances).reduce((a, b) =>
//         balances[a]! < balances[b]! ? a : b,
//       );
//       const amount = Math.min(balances[maxOwed]!, -balances[maxOwing]!);

//       debts.push({
//         from: maxOwing,
//         to: maxOwed,
//         amount,
//       });
//       balances[maxOwed]! -= amount;
//       balances[maxOwing]! += amount;

//       if (balances[maxOwed] === 0) delete balances[maxOwed];
//       if (balances[maxOwing] === 0) delete balances[maxOwing];
//     }

//     // Store simplified debts in the database
//     for (const debt of debts) {
//       await splitdb.simplifiedDebt.create({
//         data: {
//           fromId: debt.from,
//           toId: debt.to,
//           amount: debt.amount,
//           groupId,
//         },
//       });
//     }
//     return { message: "Simplified debts calculated and stored" };
//   } catch (err) {
//     console.error("\n\nError calculating simplified debts:\n\n", err);
//     return { message: "Error calculating simplified debts" };
//   }
// }
