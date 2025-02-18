"use server";

import splitdb from "@fondingo/db-split";
import {
  Expense,
  ExpensePayment,
  ExpenseSplit,
  ChangeType,
  Prisma,
} from "@prisma/client";

// Type for expense with its related payments and splits
type ExpenseWithRelations = Expense & {
  payments: ExpensePayment[];
  splits: ExpenseSplit[];
};

// Type for audit log with parsed state
type ExpenseAuditLogWithParsedState = Omit<
  Awaited<ReturnType<typeof getExpenseChangesSince>>[number],
  "oldState"
> & {
  oldState: ExpenseWithRelations;
};

/**
 * Creates an audit log entry for an expense change.
 * Stores the complete state of the expense including all payments and splits.
 * This is used to track changes for incremental debt calculations.
 *
 * @param expense - The expense being changed (with payments and splits)
 * @param changeType - The type of change (CREATED, UPDATED, DELETED)
 */
export async function createAuditLog(
  expense: ExpenseWithRelations,
  changeType: ChangeType,
) {
  const oldState: Prisma.JsonObject = {
    ...expense,
    payments: expense.payments,
    splits: expense.splits,
    createdAt: expense.createdAt.toISOString(),
    updatedAt: expense.updatedAt.toISOString(),
  };

  await splitdb.expenseAuditLog.create({
    data: {
      expenseId: expense.id,
      groupId: expense.groupId,
      changeType,
      oldState,
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
 * For updates: Currently throws error (requires full recalculation)
 *
 * @param auditLogRaw - The audit log entry to process
 * @returns Map of member IDs to their balance changes
 */
export async function processExpenseChange(
  auditLogRaw: Awaited<ReturnType<typeof getExpenseChangesSince>>[number],
): Promise<Map<string, number>> {
  // Parse the stored JSON state back into the correct shape
  const auditLog: ExpenseAuditLogWithParsedState = {
    ...auditLogRaw,
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
      // For updates, we'd need the new state to calculate the difference
      // This would require modifying the audit log to store both old and new states
      // For now, we'll handle updates by doing a full recalculation
      throw new Error("Updates require full recalculation");
  }

  return balanceChanges;
}
