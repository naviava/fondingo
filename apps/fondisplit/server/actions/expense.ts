"use server";

import { privateProcedure } from "~/server/trpc";
import { TRPCError } from "@trpc/server";
import splitdb from "@fondingo/db-split";
import { z } from "@fondingo/utils/zod";

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
      select: { id: true },
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
