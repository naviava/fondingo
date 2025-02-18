"use server";

import splitdb from "@fondingo/db-split";
import {
  Expense,
  ExpensePayment,
  ExpenseSplit,
  ChangeType,
  Prisma,
  ExpenseAuditLog,
} from "@prisma/client";

// Type for expense with its related payments and splits
type ExpenseWithRelations = Expense & {
  payments: ExpensePayment[];
  splits: ExpenseSplit[];
};

// Type for audit log with parsed state
type ExpenseAuditLogWithParsedState = Omit<
  ExpenseAuditLog,
  "oldState" | "newState"
> & {
  oldState: ExpenseWithRelations;
  newState?: ExpenseWithRelations;
};

/**
 * Creates an audit log entry for an expense change.
 * Stores the complete state of the expense including all payments and splits.
 * For updates, stores both old and new states to enable efficient debt calculations.
 *
 * @param expense - The current state of the expense (with payments and splits)
 * @param changeType - The type of change (CREATED, UPDATED, DELETED)
 * @param oldExpense - The previous state for updates, required when changeType is UPDATED
 */
export async function createAuditLog(
  expense: ExpenseWithRelations,
  changeType: ChangeType,
  oldExpense?: ExpenseWithRelations,
) {
  // For updates, we need both old and new states
  if (changeType === "UPDATED" && !oldExpense) {
    throw new Error("Old expense state required for updates");
  }

  const oldState: Prisma.JsonObject =
    changeType === "UPDATED"
      ? {
          ...oldExpense!,
          payments: oldExpense!.payments,
          splits: oldExpense!.splits,
          createdAt: oldExpense!.createdAt.toISOString(),
          updatedAt: oldExpense!.updatedAt.toISOString(),
        }
      : {
          ...expense,
          payments: expense.payments,
          splits: expense.splits,
          createdAt: expense.createdAt.toISOString(),
          updatedAt: expense.updatedAt.toISOString(),
        };

  const newState: Prisma.JsonObject | undefined =
    changeType === "UPDATED"
      ? {
          ...expense,
          payments: expense.payments,
          splits: expense.splits,
          createdAt: expense.createdAt.toISOString(),
          updatedAt: expense.updatedAt.toISOString(),
        }
      : undefined;

  await splitdb.expenseAuditLog.create({
    data: {
      expenseId: expense.id,
      groupId: expense.groupId,
      changeType,
      oldState,
      newState,
    },
  });
}

/**
 * Gets all expense changes since a specific time.
 * Used by the debt calculator to process only new changes
 * instead of recalculating everything.
 *
 * @param groupId - The group to get changes for
 * @param since - The timestamp to get changes since
 */
export async function getExpenseChangesSince(groupId: string, since: Date) {
  return splitdb.expenseAuditLog.findMany({
    where: {
      groupId,
      createdAt: { gt: since },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

/**
 * Processes an expense change for debt calculation.
 * Returns a map of member IDs to their balance changes.
 * For deletions: Reverses the original payments and splits
 * For creations: Applies the payments and splits
 * For updates: Calculates the delta between old and new states
 *
 * @param auditLogRaw - The audit log entry to process
 * @returns Map of member IDs to their balance changes
 */
export async function processExpenseChange(
  auditLogRaw: ExpenseAuditLog,
): Promise<Map<string, number>> {
  // Parse the stored JSON states back into the correct shape
  const auditLog: ExpenseAuditLogWithParsedState = {
    id: auditLogRaw.id,
    expenseId: auditLogRaw.expenseId,
    groupId: auditLogRaw.groupId,
    changeType: auditLogRaw.changeType,
    createdAt: auditLogRaw.createdAt,
    updatedAt: auditLogRaw.updatedAt,
    oldState: {
      ...(auditLogRaw.oldState as Prisma.JsonObject),
      createdAt: new Date(
        (auditLogRaw.oldState as Prisma.JsonObject).createdAt as string,
      ),
      updatedAt: new Date(
        (auditLogRaw.oldState as Prisma.JsonObject).updatedAt as string,
      ),
    } as ExpenseWithRelations,
  };

  if (auditLogRaw.newState) {
    auditLog.newState = {
      ...(auditLogRaw.newState as Prisma.JsonObject),
      createdAt: new Date(
        (auditLogRaw.newState as Prisma.JsonObject).createdAt as string,
      ),
      updatedAt: new Date(
        (auditLogRaw.newState as Prisma.JsonObject).updatedAt as string,
      ),
    } as ExpenseWithRelations;
  }

  const balanceChanges = new Map<string, number>();
  const oldState = auditLog.oldState;

  switch (auditLog.changeType) {
    case "DELETED":
      // For deletions, reverse all payments and splits
      oldState.payments.forEach((payment) => {
        const current = balanceChanges.get(payment.groupMemberId) ?? 0;
        balanceChanges.set(payment.groupMemberId, current - payment.amount);
      });

      oldState.splits.forEach((split) => {
        const current = balanceChanges.get(split.groupMemberId) ?? 0;
        balanceChanges.set(split.groupMemberId, current + split.amount);
      });
      break;

    case "CREATED":
      // For new expenses, add all payments and splits
      oldState.payments.forEach((payment) => {
        const current = balanceChanges.get(payment.groupMemberId) ?? 0;
        balanceChanges.set(payment.groupMemberId, current + payment.amount);
      });

      oldState.splits.forEach((split) => {
        const current = balanceChanges.get(split.groupMemberId) ?? 0;
        balanceChanges.set(split.groupMemberId, current - split.amount);
      });
      break;

    case "UPDATED":
      if (!auditLog.newState) {
        throw new Error("New state required for updates");
      }

      // For updates, calculate the delta between old and new states
      const newState = auditLog.newState;

      // First reverse the old payments and splits
      oldState.payments.forEach((payment) => {
        const current = balanceChanges.get(payment.groupMemberId) ?? 0;
        balanceChanges.set(payment.groupMemberId, current - payment.amount);
      });

      oldState.splits.forEach((split) => {
        const current = balanceChanges.get(split.groupMemberId) ?? 0;
        balanceChanges.set(split.groupMemberId, current + split.amount);
      });

      // Then apply the new payments and splits
      newState.payments.forEach((payment) => {
        const current = balanceChanges.get(payment.groupMemberId) ?? 0;
        balanceChanges.set(payment.groupMemberId, current + payment.amount);
      });

      newState.splits.forEach((split) => {
        const current = balanceChanges.get(split.groupMemberId) ?? 0;
        balanceChanges.set(split.groupMemberId, current - split.amount);
      });
      break;
  }

  return balanceChanges;
}
