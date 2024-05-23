"use server";

import { privateProcedure } from "~/server/trpc";
import { TRPCError } from "@trpc/server";
import splitdb from "@fondingo/db-split";
import { z } from "@fondingo/utils/zod";
import { calculateDebts } from "./group";

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
