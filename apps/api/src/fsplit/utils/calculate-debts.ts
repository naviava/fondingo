"use server";

import splitdb from "@fondingo/db-split";
import {
  getExpenseChangesSince,
  processExpenseChange,
  createAuditLog,
} from "./expense-audit";
import { ChangeType } from "@prisma/client";
import {
  getSettlementChangesSince,
  processSettlementChange,
} from "./settlement-audit";

/**
 * Calculates and simplifies debts within a group by processing expenses, splits, and settlements.
 * This function uses an optimized approach with audit logs:
 * 1. For first-time calculation, it processes all transactions
 * 2. For subsequent calculations, it uses audit logs to process only the changes
 * 3. For expense updates, it falls back to full recalculation
 *
 * Note on Expense Deletions:
 * - When an expense is deleted, we need to recalculate all debts
 * - This is because deleted expenses cascade delete their payments and splits
 * - Without an audit log, we can't determine what the old values were
 * - Therefore, we do a full recalculation when any expense is modified or deleted
 *
 * @param groupId - The ID of the group to calculate debts for
 * @param isManualUpdate - Whether this is a manual update (only affects logging behavior)
 * @returns Success or error message
 */
export async function calculateDebts(
  groupId: string,
  isManualUpdate: boolean = false,
): Promise<{ success: string } | { error: string }> {
  try {
    return splitdb.$transaction(async (tx) => {
      // Add a lock to prevent concurrent calculations
      const group = await tx.group.findUnique({
        where: { id: groupId },
        select: {
          lastCacluatedDebtsAt: true,
          updatedAt: true, // Used for optimistic locking
        },
      });

      if (!group) {
        return { error: "Group not found" };
      }

      // For first-time calculation or if no previous calculation exists,
      // we need to process all transactions from scratch
      if (!group.lastCacluatedDebtsAt) {
        return calculateAllDebts(tx, groupId, isManualUpdate);
      }

      // Get all changes since last calculation from audit logs
      const [expenseChanges, settlementChanges] = await Promise.all([
        getExpenseChangesSince(groupId, group.lastCacluatedDebtsAt),
        getSettlementChangesSince(groupId, group.lastCacluatedDebtsAt),
      ]);

      // If no changes, return early
      if (expenseChanges.length === 0 && settlementChanges.length === 0) {
        return { success: "No new transactions to process" };
      }

      // Get current simplified debts to use as starting point
      const existingDebts = await tx.simplifiedDebt.findMany({
        where: { groupId },
      });

      // Convert simplified debts into a balance sheet
      const balances: { [key: string]: number } = {};
      for (const debt of existingDebts) {
        // Validate and round amount
        const validAmount = validateAmount(debt.amount);
        if (validAmount === null) {
          return {
            error: "Invalid debt amount: must be a whole number of cents",
          };
        }
        balances[debt.fromId] = (balances[debt.fromId] || 0) - validAmount;
        balances[debt.toId] = (balances[debt.toId] || 0) + validAmount;
      }

      // Process all expense changes from audit log
      for (const change of expenseChanges) {
        const changeBalances = await processExpenseChange(change);
        for (const [memberId, amount] of changeBalances.entries()) {
          const validAmount = validateAmount(amount);
          if (validAmount === null) {
            return {
              error: "Invalid expense amount: must be a whole number of cents",
            };
          }
          balances[memberId] = (balances[memberId] || 0) + validAmount;
        }
      }

      // Process all settlement changes from audit log
      for (const change of settlementChanges) {
        const changeBalances = await processSettlementChange(change);
        for (const [memberId, amount] of changeBalances.entries()) {
          const validAmount = validateAmount(amount);
          if (validAmount === null) {
            return {
              error:
                "Invalid settlement amount: must be a whole number of cents",
            };
          }
          balances[memberId] = (balances[memberId] || 0) + validAmount;
        }
      }

      // Clear existing simplified debts before storing new ones
      await tx.simplifiedDebt.deleteMany({
        where: { groupId },
      });

      // Prepare array to store simplified debts
      const debts: {
        from: string;
        to: string;
        amount: number;
      }[] = [];

      // Simplify the debts using a greedy algorithm
      while (
        Object.keys(balances).length > 0 &&
        Object.keys(balances).length > 1
      ) {
        const maxOwed = Object.keys(balances).reduce((a, b) =>
          (balances[a] ?? 0) > (balances[b] ?? 0) ? a : b,
        );
        const maxOwing = Object.keys(balances).reduce((a, b) =>
          (balances[a] ?? 0) < (balances[b] ?? 0) ? a : b,
        );
        const amount = Math.min(
          Math.abs(balances[maxOwed] ?? 0),
          Math.abs(balances[maxOwing] ?? 0),
        );

        if (amount > 0) {
          debts.push({
            from: maxOwing,
            to: maxOwed,
            amount,
          });
        }

        balances[maxOwed] = (balances[maxOwed] ?? 0) - amount;
        balances[maxOwing] = (balances[maxOwing] ?? 0) + amount;

        if (balances[maxOwed] === 0) delete balances[maxOwed];
        if (balances[maxOwing] === 0) delete balances[maxOwing];
      }

      // Store the simplified debts in the database
      for (const debt of debts) {
        if (debt.amount > 0) {
          // Explicit positive amount check
          await tx.simplifiedDebt.create({
            data: {
              fromId: debt.from,
              toId: debt.to,
              amount: debt.amount,
              groupId,
            },
          });
        }
      }

      // Use optimistic locking to prevent race conditions
      const updated = await tx.group.update({
        where: {
          id: groupId,
          updatedAt: group.updatedAt, // Only update if no other changes happened
        },
        data: {
          lastCacluatedDebtsAt: new Date(),
        },
      });

      if (!updated) {
        return { error: "Calculation conflict detected, please retry" };
      }

      return { success: "Simplified debts calculated and stored" };
    });
  } catch (err) {
    console.error("\n\nError calculating simplified debts:\n\n", err);
    return { error: "Error calculating simplified debts" };
  }
}

/**
 * Helper function to calculate all debts from scratch for a group.
 * This is used when:
 * 1. It's the first time calculating debts for the group
 * 2. Previous calculations are invalid/missing
 * 3. Expenses were modified/deleted since last calculation
 *
 * The function:
 * 1. Fetches all transactions (payments, splits, settlements)
 * 2. Calculates net balances for each member
 * 3. Simplifies the debts to minimize number of transactions
 *
 * @param tx - Prisma transaction client
 * @param groupId - ID of the group to calculate debts for
 * @param isManualUpdate - Whether this is a manual update
 */
async function calculateAllDebts(
  tx: Parameters<Parameters<typeof splitdb.$transaction>[0]>[0],
  groupId: string,
  isManualUpdate: boolean,
) {
  // Clear any existing simplified debts for the group
  await tx.simplifiedDebt.deleteMany({
    where: { groupId },
  });

  // Get all expense payments in the group
  const payments = await tx.expensePayment.findMany({
    where: {
      expense: { groupId },
    },
    include: { expense: true },
  });

  // Get all expense splits in the group
  const splits = await tx.expenseSplit.findMany({
    where: {
      expense: { groupId },
    },
    include: { expense: true },
  });

  // Get all settlements between group members
  const settlements = await tx.settlement.findMany({
    where: {
      groupId,
    },
  });

  // Calculate net balance for each member
  const balances: { [key: string]: number } = {};

  // Add positive balance for payments made
  for (const payment of payments) {
    const validAmount = validateAmount(payment.amount);
    if (validAmount === null) {
      return {
        error: "Invalid payment amount: must be a whole number of cents",
      };
    }
    const paidBy = payment.groupMemberId;

    if (!balances[paidBy]) balances[paidBy] = 0;
    balances[paidBy] += validAmount;
  }

  // Add negative balance for expense splits (amounts owed)
  for (const split of splits) {
    const validAmount = validateAmount(split.amount);
    if (validAmount === null) {
      return { error: "Invalid split amount: must be a whole number of cents" };
    }
    const owes = split.groupMemberId;

    if (!balances[owes]) balances[owes] = 0;
    balances[owes] -= validAmount;
  }

  // Process settlements (direct transfers between members)
  for (const settlement of settlements) {
    const validAmount = validateAmount(settlement.amount);
    if (validAmount === null) {
      return {
        error: "Invalid settlement amount: must be a whole number of cents",
      };
    }
    const paidBy = settlement.fromId;
    const receivedBy = settlement.toId;

    if (!balances[paidBy]) balances[paidBy] = 0;
    if (!balances[receivedBy]) balances[receivedBy] = 0;
    balances[paidBy] -= validAmount;
    balances[receivedBy] += validAmount;
  }

  // Array to store simplified debts
  const debts: {
    from: string;
    to: string;
    amount: number;
  }[] = [];

  // Simplify debts using the same greedy algorithm
  while (Object.keys(balances).length > 0 && Object.keys(balances).length > 1) {
    const maxOwed = Object.keys(balances).reduce((a, b) =>
      (balances[a] ?? 0) > (balances[b] ?? 0) ? a : b,
    );
    const maxOwing = Object.keys(balances).reduce((a, b) =>
      (balances[a] ?? 0) < (balances[b] ?? 0) ? a : b,
    );
    const amount = Math.min(balances[maxOwed]!, -balances[maxOwing]!);

    if (amount > 0) {
      // Explicit positive amount check
      debts.push({
        from: maxOwing,
        to: maxOwed,
        amount,
      });
    }
    balances[maxOwed]! -= amount;
    balances[maxOwing]! += amount;

    if (balances[maxOwed] === 0) delete balances[maxOwed];
    if (balances[maxOwing] === 0) delete balances[maxOwing];
  }

  // Store simplified debts in the database
  for (const debt of debts) {
    if (debt.amount > 0) {
      // Explicit positive amount check
      await tx.simplifiedDebt.create({
        data: {
          fromId: debt.from,
          toId: debt.to,
          amount: debt.amount,
          groupId,
        },
      });
    }
  }

  // Always update last calculation timestamp
  await tx.group.update({
    where: { id: groupId },
    data: {
      lastCacluatedDebtsAt: new Date(),
    },
  });

  return { success: "Simplified debts calculated and stored" };
}

/**
 * Validates that an amount is a valid integer value in cents.
 * Since all amounts are stored as integers in cents in the database,
 * we just need to verify the value is a valid integer.
 *
 * @param amount - The amount to validate (in cents)
 * @returns The amount if valid, or null if invalid
 */
function validateAmount(amount: number): number | null {
  // Check if it's a valid number and an integer
  if (
    typeof amount !== "number" ||
    isNaN(amount) ||
    !Number.isInteger(amount)
  ) {
    return null;
  }

  return amount;
}
