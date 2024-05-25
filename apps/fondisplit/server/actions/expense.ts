"use server";

import { privateProcedure } from "~/server/trpc";
import { TRPCError } from "@trpc/server";
import splitdb from "@fondingo/db-split";
import { z } from "@fondingo/utils/zod";
import { calculateDebts } from "./group";
import { hasDuplicates } from "~/lib/utils";

/**
 * This function is used to add an expense to a group. It is a private procedure that takes an input object with the following properties:
 * - groupId: A string representing the ID of the group. It must be at least 1 character long.
 * - expenseName: A string representing the name of the expense. It must be at least 1 character long.
 * - expenseAmount: A number representing the total amount of the expense.
 * - payments: An array of objects, each representing a payment. Each object should have a 'userId' property (a string of at least 1 character) and an 'amount' property (a number).
 * - splits: An array of objects, each representing a split. Each object should have a 'userId' property (a string of at least 1 character) and an 'amount' property (a number).
 *
 * The function performs several checks:
 * - It checks if the group exists and if the user is a member of the group.
 * - It checks if the total amount of payments and splits matches the total expense amount.
 * - It checks if the expense amount is greater than or equal to 1.
 * - It checks if there are duplicate users in payments or splits.
 * - It checks if the payment or split amount is greater than 0.
 * - It checks if the user making the payment or split is a member of the group.
 *
 * If any of these checks fail, it throws an error with a relevant message.
 *
 * If all checks pass, it creates a new expense in the database, creates the payments and splits associated with the expense, and calculates the debts for the group.
 *
 * If any of these operations fail, it throws an error with a relevant message.
 *
 * If all operations are successful, it returns an object with a 'toastTitle' and 'toastDescription' property, indicating that the expense was successfully added.
 *
 * @async
 * @function
 * @param {Object} ctx - The context object, which includes the user.
 * @param {Object} input - The input object, which includes the groupId, expenseName, expenseAmount, payments, and splits.
 * @returns {Promise<Object>} A promise that resolves to an object with a 'toastTitle' and 'toastDescription' property.
 * @throws {TRPCError} If any of the checks or operations fail.
 */
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

    try {
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

      if (expenseAmount <= 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Expense amount should be greater than 0",
        });

      const groupMembers = await splitdb.groupMember.findMany({
        where: { groupId },
      });
      const groupMemberIds = groupMembers.map((member) => member.id);

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

      const expense = await splitdb.$transaction(async (db) => {
        const expense = await db.expense.create({
          data: {
            groupId,
            name: expenseName,
            amount: Math.floor(expenseAmount * 100),
            createdById: user.id,
            lastModifiedById: user.id,
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
        return expense;
      });

      const res = await calculateDebts(groupId);
      if (!("success" in res) || !res.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to calculate debts",
        });
      }
      return {
        toastTitle: `${expense.name} added`,
        toastDescription: `Expense of ${expense.amount / 100} added to the group`,
      };
    } catch (err) {
      console.error("\n\nError adding expense:\n\n", err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong. Try again later.",
      });
    }
  });

export const updateExpense = privateProcedure
  .input(
    z.object({
      groupId: z.string().min(1, { message: "Group ID is required" }),
      expenseId: z.string().min(1, { message: "Expense ID is required" }),
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
    const { groupId, expenseId, expenseName, expenseAmount, payments, splits } =
      input;

    try {
      const existingExpense = await splitdb.expense.findUnique({
        where: {
          id: expenseId,
          groupId,
          group: {
            members: {
              some: { userId: user.id },
            },
          },
        },
      });
      if (!existingExpense)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Expense not found",
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

      if (expenseAmount <= 0)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Expense amount should be greater than 0",
        });

      const groupMembers = await splitdb.groupMember.findMany({
        where: { groupId },
      });
      const groupMemberIds = groupMembers.map((member) => member.id);

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

      const updatedExpense = await splitdb.$transaction(async (db) => {
        await db.expensePayment.deleteMany({
          where: { expenseId: existingExpense.id },
        });
        await db.expenseSplit.deleteMany({
          where: { expenseId: existingExpense.id },
        });

        const updatedExpense = await db.expense.update({
          where: { id: existingExpense.id },
          data: {
            name: expenseName,
            amount: Math.floor(expenseAmount * 100),
            lastModifiedById: user.id,
            groupId,
          },
        });
        if (!updatedExpense)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to update expense",
          });

        for (const payment of payments) {
          const expensePayment = await db.expensePayment.create({
            data: {
              amount: Math.floor(payment.amount * 100),
              groupMemberId: payment.userId,
              expenseId: updatedExpense.id,
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
              expenseId: updatedExpense.id,
            },
          });
          if (!expenseSplit)
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to create split",
            });
        }
        return updatedExpense;
      });

      const res = await calculateDebts(groupId);
      if (!("success" in res) || !res.success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to calculate debts",
        });
      }
      return {
        toastTitle: `${updatedExpense.name} added`,
        toastDescription: `Expense of ${updatedExpense.amount / 100} added to the group`,
      };
    } catch (err) {
      console.error("\n\nError adding expense:\n\n", err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong. Try again later.",
      });
    }
  });

export const getExpenseIds = privateProcedure
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
    });
    if (!group)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Group not found",
      });

    const expenses = await splitdb.expense.findMany({
      where: { groupId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
      },
    });
    return expenses || [];
  });

export const getExpenseById = privateProcedure
  .input(
    z.object({
      expenseId: z.string().min(1, { message: "Expense ID cannot be empty" }),
      groupId: z.string().min(1, { message: "Group ID cannot be empty" }),
    }),
  )
  .query(async ({ input }) => {
    const { expenseId, groupId } = input;

    const existingExpense = await splitdb.expense.findUnique({
      where: {
        id: expenseId,
        groupId,
      },
      include: {
        createdBy: true,
        payments: {
          include: {
            groupMember: {
              include: { user: true },
            },
          },
        },
        splits: {
          include: {
            groupMember: {
              include: { user: true },
            },
          },
        },
      },
    });
    if (!existingExpense)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Expense not found",
      });
    return existingExpense;
  });

export const deleteExpenseById = privateProcedure
  .input(
    z.object({
      groupId: z.string().min(1, { message: "Group ID cannot be empty" }),
      expenseId: z.string().min(1, { message: "Expense ID cannot be empty" }),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { groupId, expenseId } = input;

    const existingExpense = await splitdb.expense.findUnique({
      where: {
        id: expenseId,
        groupId,
        group: {
          members: {
            some: { userId: user.id },
          },
        },
      },
    });
    if (!existingExpense)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Expense not found",
      });
    const deletedExpense = await splitdb.expense.delete({
      where: { id: existingExpense.id },
    });
    if (!deletedExpense)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete expense",
      });

    const res = await calculateDebts(groupId);
    if (!("success" in res) || !res.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to calculate debts",
      });
    }

    return {
      toastTitle: `${deletedExpense.name} deleted`,
      toastDescription: `The expense of ${(deletedExpense.amount / 100).toFixed(2)} has been deleted successfully.`,
    };
  });

export const getSettlements = privateProcedure
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
    });
    if (!group)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Group not found",
      });

    const settlements = await splitdb.settlement.findMany({
      where: { groupId },
      include: {
        from: {
          include: { user: true },
        },
        to: {
          include: { user: true },
        },
      },
    });
    return settlements || [];
  });

export const getSettlementById = privateProcedure
  .input(
    z.object({
      groupId: z.string().min(1, { message: "Group ID cannot be empty" }),
      settlementId: z
        .string()
        .min(1, { message: "Settlement ID cannot be empty" }),
    }),
  )
  .query(async ({ ctx, input }) => {
    const { user } = ctx;
    const { groupId, settlementId } = input;

    const existingSettlement = await splitdb.settlement.findUnique({
      where: {
        id: settlementId,
        groupId,
        group: {
          members: {
            some: { userId: user.id },
          },
        },
      },
      include: {
        createdBy: true,
        from: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        to: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });
    if (!existingSettlement)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Settlement not found",
      });

    return existingSettlement;
  });

export const deleteSettlementById = privateProcedure
  .input(
    z.object({
      groupId: z.string().min(1, { message: "Group ID cannot be empty" }),
      settlementId: z
        .string()
        .min(1, { message: "Settlement ID cannot be empty" }),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { groupId, settlementId } = input;

    const existingSettlement = await splitdb.settlement.findUnique({
      where: {
        id: settlementId,
        groupId,
        group: {
          members: {
            some: { userId: user.id },
          },
        },
      },
    });
    if (!existingSettlement)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Settlement not found",
      });
    const deletedSettlement = await splitdb.settlement.delete({
      where: { id: existingSettlement.id },
    });
    if (!deletedSettlement)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete Settlement",
      });

    const res = await calculateDebts(groupId);
    if (!("success" in res) || !res.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to calculate debts",
      });
    }

    return {
      toastTitle: `Payment deleted`,
      toastDescription: `The payment of ${(deletedSettlement.amount / 100).toFixed(2)} has been deleted successfully.`,
    };
  });
