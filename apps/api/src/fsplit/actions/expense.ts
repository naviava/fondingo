import { privateProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

import { calculateDebts } from "../utils/calculate-debts";
import { hasDuplicates } from "../utils";
import splitdb from "@fondingo/db-split";
import { z } from "@fondingo/utils/zod";

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
    const { splits, groupId, payments, expenseName, expenseAmount } = input;

    try {
      const group = await splitdb.group.findUnique({
        where: {
          id: groupId,
          members: {
            some: { userId: user.id, isDeleted: false },
          },
        },
        include: { members: true },
      });
      if (!group)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Group not found",
        });
      const userInGroup = group.members.find(
        (member) => member.userId === user.id,
      );
      if (!userInGroup)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User not in group",
        });

      const totalPaymentsAmount = payments.reduce(
        (acc, payment) => acc + Math.floor(payment.amount * 100),
        0,
      );
      const totalSplitsAmount = splits.reduce(
        (acc, split) => acc + Math.floor(split.amount * 100),
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
        where: {
          groupId,
          isDeleted: false,
        },
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
            amount: expenseAmount,
            createdById: user.id,
            lastModifiedById: user.id,
          },
        });
        if (!expense)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create expense",
          });

        const log = await db.log.create({
          data: {
            type: "EXPENSE",
            groupId,
            userId: user.id,
            expenseId: expense.id,
            message: `${userInGroup.name} added an expense "${expense.name}", of ${group.currency} ${(expense.amount / 100).toFixed(2)}`,
          },
        });
        if (!log)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create log. Expense not added.",
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
    const { splits, groupId, payments, expenseId, expenseName, expenseAmount } =
      input;

    const existingExpense = await splitdb.expense.findUnique({
      where: {
        id: expenseId,
        groupId,
        group: {
          members: {
            some: {
              userId: user.id,
              isDeleted: false,
            },
          },
        },
      },
      include: {
        group: {
          include: { members: true },
        },
      },
    });
    if (!existingExpense)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Expense not found",
      });
    const userInGroup = existingExpense.group.members.find(
      (m) => m.userId === user.id,
    );
    if (!userInGroup)
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User not in group",
      });

    const totalPaymentsAmount = payments.reduce(
      (acc, payment) => acc + Math.floor(payment.amount * 100),
      0,
    );
    const totalSplitsAmount = splits.reduce((acc, split) => {
      return acc + Math.floor(split.amount * 100);
    }, 0);
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
      where: {
        groupId,
        isDeleted: false,
      },
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
          amount: expenseAmount,
          lastModifiedById: user.id,
          groupId,
        },
        include: {
          group: {
            select: { currency: true },
          },
        },
      });
      if (!updatedExpense)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update expense",
        });

      if (updatedExpense.name !== existingExpense.name) {
        const log = await db.log.create({
          data: {
            type: "EXPENSE",
            groupId,
            userId: user.id,
            expenseId: updatedExpense.id,
            message: `${userInGroup.name} updated the name to "${updatedExpense.name}"`,
          },
        });
        if (!log)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create name log. Expense not updated.",
          });
      }
      if (updatedExpense.amount !== existingExpense.amount) {
        const log = await db.log.create({
          data: {
            type: "EXPENSE",
            groupId,
            userId: user.id,
            expenseId: updatedExpense.id,
            message: `${userInGroup.name} updated the amount of "${updatedExpense.name}", to ${updatedExpense.group.currency} ${(updatedExpense.amount / 100).toFixed(2)}`,
          },
        });
        if (!log)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create amount log. Expense not updated.",
          });
      }

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
        lastModifiedBy: true,
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
            some: {
              userId: user.id,
            },
          },
        },
      },
      include: {
        group: {
          include: { members: true },
        },
      },
    });
    if (!existingExpense)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Expense not found",
      });
    const userInGroup = existingExpense.group.members.find(
      (m) => m.userId === user.id,
    );
    if (!userInGroup)
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User not in group",
      });

    const deletedExpense = await splitdb.$transaction(async (db) => {
      const deletedExpense = await db.expense.delete({
        where: { id: existingExpense.id },
      });
      if (!deletedExpense)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete expense",
        });

      const log = await db.log.create({
        data: {
          type: "GROUP",
          groupId,
          userId: user.id,
          message: `${userInGroup.name} deleted an expense "${deletedExpense.name}", of ${existingExpense.group.currency} ${(deletedExpense.amount / 100).toFixed(2)}`,
        },
      });
      if (!log)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create log. Expense not deleted.",
        });
      return deletedExpense;
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
      toastDescription: `The expense of ${(deletedExpense.amount / 100).toLocaleString()} has been deleted successfully.`,
    };
  });

export const addSettlement = privateProcedure
  .input(
    z.object({
      groupId: z.string().min(1, { message: "Group ID cannot be empty" }),
      fromId: z.string().min(1, { message: "Debtor ID cannot be empty" }),
      toId: z.string().min(1, { message: "Creditor ID cannot be empty" }),
      amount: z.number(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { groupId, fromId, toId, amount } = input;

    if (fromId === toId)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Debtor and creditor cannot be the same",
      });
    if (amount <= 0)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Amount should be greater than 0",
      });

    const group = await splitdb.group.findUnique({
      where: {
        id: groupId,
        members: {
          some: { userId: user.id },
        },
      },
      include: { members: true },
    });
    if (!group)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Group not found",
      });

    const isDebtorInGroup = group.members.some(
      (member) => member.id === fromId && !member.isDeleted,
    );
    const isCreditInGroup = group.members.some(
      (member) => member.id === toId && !member.isDeleted,
    );
    if (!isDebtorInGroup || !isCreditInGroup)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Both debtor and creditor should be in the group",
      });

    const settlement = await splitdb.$transaction(async (db) => {
      const settlement = await db.settlement.create({
        data: {
          groupId,
          fromId,
          toId,
          createdById: user.id,
          lastModifiedById: user.id,
          amount: Math.floor(amount * 100),
        },
        include: {
          from: true,
          to: true,
          group: {
            include: { members: true },
          },
        },
      });
      if (!settlement)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create settlement",
        });
      const userInGroup = settlement.group.members.find(
        (m) => m.userId === user.id,
      );
      if (!userInGroup)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User not in group",
        });

      const log = await db.log.create({
        data: {
          type: "SETTLEMENT",
          groupId,
          userId: user.id,
          settlementId: settlement.id,
          message: `${userInGroup.name} added a payment of ${group.currency} ${(settlement.amount / 100).toFixed(2)}, from ${settlement.from.name} to ${settlement.to.name}`,
        },
      });
      if (!log)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create log. Settlement not added.",
        });
      return settlement;
    });

    const res = await calculateDebts(groupId);
    if (!("success" in res) || !res.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to calculate debts",
      });
    }
    return {
      toastTitle: "Settlement added",
      toastDescription: `${settlement.from.name} paid ${settlement.to.name} ${group.currency}${settlement.amount / 100}`,
    };
  });

export const updateSettlement = privateProcedure
  .input(
    z.object({
      settlementId: z
        .string()
        .min(1, { message: "Settlement ID cannot be empty" }),
      groupId: z.string().min(1, { message: "Group ID cannot be empty" }),
      fromId: z.string().min(1, { message: "Debtor ID cannot be empty" }),
      toId: z.string().min(1, { message: "Creditor ID cannot be empty" }),
      amount: z.number(),
    }),
  )
  .mutation(async ({ ctx, input }) => {
    const { user } = ctx;
    const { settlementId, groupId, fromId, toId, amount } = input;

    if (fromId === toId)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Debtor and creditor cannot be the same",
      });
    if (amount <= 0)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Amount should be greater than 0",
      });

    const existingSettlement = await splitdb.settlement.findUnique({
      where: {
        id: settlementId,
        groupId,
      },
      include: {
        group: {
          include: { members: true },
        },
      },
    });
    if (!existingSettlement)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Settlement not found",
      });

    const isDebtorInGroup = existingSettlement.group.members.some(
      (member) => member.id === fromId && !member.isDeleted,
    );
    const isCreditInGroup = existingSettlement.group.members.some(
      (member) => member.id === toId && !member.isDeleted,
    );
    if (!isDebtorInGroup || !isCreditInGroup)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Both debtor and creditor should be in the group",
      });

    const updatedSettlement = await splitdb.$transaction(async (db) => {
      const updatedSettlement = await db.settlement.update({
        where: {
          id: existingSettlement.id,
        },
        data: {
          fromId,
          toId,
          lastModifiedById: user.id,
          amount: Math.floor(amount * 100),
        },
        include: {
          from: true,
          to: true,
          group: {
            include: { members: true },
          },
        },
      });
      if (!updatedSettlement)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update settlement",
        });
      const userInGroup = updatedSettlement.group.members.find(
        (m) => m.userId === user.id,
      );
      if (!userInGroup)
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "User not in group",
        });

      const isDebtorSame =
        existingSettlement.fromId === updatedSettlement.fromId;
      const isCreditorSame = existingSettlement.toId === updatedSettlement.toId;
      const isAmountSame =
        existingSettlement.amount === updatedSettlement.amount;

      if (!isDebtorSame || !isCreditorSame || !isAmountSame) {
        const log = await db.log.create({
          data: {
            type: "SETTLEMENT",
            groupId,
            userId: user.id,
            settlementId: updatedSettlement.id,
            message: `${userInGroup.name} updated the payment to ${updatedSettlement.group.currency}${updatedSettlement.amount / 100}, from ${updatedSettlement.from.name} to ${updatedSettlement.to.name}.`,
          },
        });
        if (!log)
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create log. Settlement not updated.",
          });
      }
      return updatedSettlement;
    });

    const res = await calculateDebts(groupId);
    if (!("success" in res) || !res.success) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to calculate debts",
      });
    }

    return {
      toastTitle: "Settlement updated",
      toastDescription: `${updatedSettlement.from.name} paid ${updatedSettlement.to.name} $${updatedSettlement.amount / 100}`,
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
            some: {
              userId: user.id,
            },
          },
        },
      },
      include: {
        createdBy: true,
        lastModifiedBy: true,
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
            some: {
              userId: user.id,
            },
          },
        },
      },
      include: {
        group: {
          include: { members: true },
        },
      },
    });
    if (!existingSettlement)
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Settlement not found",
      });
    const userInGroup = existingSettlement.group.members.find(
      (m) => m.userId === user.id,
    );
    if (!userInGroup)
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "User not in group",
      });

    const deletedSettlement = await splitdb.$transaction(async (db) => {
      const deletedSettlement = await db.settlement.delete({
        where: { id: existingSettlement.id },
        include: {
          from: {
            select: { name: true },
          },
          to: {
            select: { name: true },
          },
        },
      });
      if (!deletedSettlement)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete Settlement",
        });

      const log = await db.log.create({
        data: {
          type: "GROUP",
          groupId,
          userId: user.id,
          message: `${userInGroup.name} deleted a payment of ${existingSettlement.group.currency}${(deletedSettlement.amount / 100).toFixed(2)}, from ${deletedSettlement.from.name} to ${deletedSettlement.to.name}`,
        },
      });
      if (!log)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create log. Settlement not deleted.",
        });
      return deletedSettlement;
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
      toastDescription: `The payment of ${(deletedSettlement.amount / 100).toLocaleString()} has been deleted successfully.`,
    };
  });
