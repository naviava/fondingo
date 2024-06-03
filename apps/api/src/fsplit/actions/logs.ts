import { privateProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import splitdb from "@fondingo/db-split";
import { z } from "@fondingo/utils/zod";

export const userLogs = privateProcedure.query(async ({ ctx }) => {
  const { user } = ctx;

  try {
    const logs = await splitdb.log.findMany({
      where: {
        type: "USER",
        userId: user.id,
      },
      orderBy: { createdAt: "desc" },
    });
    return logs;
  } catch (err) {
    console.error(err);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to get logs",
    });
  }
});

export const expenseByIdLogs = privateProcedure
  .input(z.string().min(1, { message: "Expense ID isrequired" }))
  .query(async ({ ctx, input: expenseId }) => {
    const { user } = ctx;
    try {
      const existingExpense = await splitdb.expense.findUnique({
        where: {
          id: expenseId,
          group: {
            members: {
              some: {
                userId: user.id,
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

      const logs = await splitdb.log.findMany({
        where: {
          type: "EXPENSE",
          expenseId,
        },
        orderBy: { createdAt: "desc" },
      });
      return logs || [];
    } catch (err) {
      console.error(err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get expense logs.",
      });
    }
  });

export const settlementByIdLogs = privateProcedure
  .input(z.string().min(1, { message: "Settlement ID is required" }))
  .query(async ({ ctx, input: settlementId }) => {
    const { user } = ctx;
    try {
      const existingSettlement = await splitdb.settlement.findUnique({
        where: {
          id: settlementId,
          group: {
            members: {
              some: {
                userId: user.id,
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

      const logs = await splitdb.log.findMany({
        where: {
          type: "SETTLEMENT",
          settlementId,
        },
        orderBy: { createdAt: "desc" },
      });
      return logs || [];
    } catch (err) {
      console.error(err);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to get settlement logs.",
      });
    }
  });
