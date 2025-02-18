"use server";

import splitdb from "@fondingo/db-split";
import {
  getExpenseChangesSince,
  processExpenseChange,
  createAuditLog,
} from "./expense-audit";
import { ChangeType } from "@prisma/client";

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
 * @param isManualUpdate - Whether this is a manual update (affects lastCalculatedDebtsAt update)
 * @returns Success or error message
 */
export async function calculateDebts(
  groupId: string,
  isManualUpdate: boolean = false,
): Promise<{ success: string } | { error: string }> {
  try {
    return splitdb.$transaction(async (tx) => {
      // Check when debts were last calculated for this group
      const group = await tx.group.findUnique({
        where: { id: groupId },
        select: { lastCacluatedDebtsAt: true },
      });

      // For first-time calculation or if no previous calculation exists,
      // we need to process all transactions from scratch
      if (!group?.lastCacluatedDebtsAt) {
        return calculateAllDebts(tx, groupId, isManualUpdate);
      }

      // Get all changes since last calculation from audit log
      const changes = await getExpenseChangesSince(
        groupId,
        group.lastCacluatedDebtsAt,
      );

      // If there are any updates, we need to do a full recalculation
      // This is temporary until we implement proper update handling
      if (
        changes.some(
          (change: { changeType: ChangeType }) =>
            change.changeType === "UPDATED",
        )
      ) {
        return calculateAllDebts(tx, groupId, isManualUpdate);
      }

      // Get new settlements between group members
      const newSettlements = await tx.settlement.findMany({
        where: {
          groupId,
          createdAt: { gt: group.lastCacluatedDebtsAt },
        },
      });

      // If no changes and no new settlements, return early
      if (changes.length === 0 && newSettlements.length === 0) {
        return { success: "No new transactions to process" };
      }

      // Get current simplified debts to use as starting point
      const existingDebts = await tx.simplifiedDebt.findMany({
        where: { groupId },
      });

      // Convert simplified debts into a balance sheet
      const balances: { [key: string]: number } = {};
      for (const debt of existingDebts) {
        balances[debt.fromId] = (balances[debt.fromId] || 0) - debt.amount;
        balances[debt.toId] = (balances[debt.toId] || 0) + debt.amount;
      }

      // Process all expense changes from audit log
      for (const change of changes) {
        const changeBalances = await processExpenseChange(change);
        for (const [memberId, amount] of changeBalances.entries()) {
          balances[memberId] = (balances[memberId] || 0) + amount;
        }
      }

      // Process new settlements
      for (const settlement of newSettlements) {
        balances[settlement.fromId] =
          (balances[settlement.fromId] || 0) + settlement.amount;
        balances[settlement.toId] =
          (balances[settlement.toId] || 0) - settlement.amount;
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

      // Simplify the debts using a greedy algorithm:
      // 1. Find person who is owed the most (maxOwed)
      // 2. Find person who owes the most (maxOwing)
      // 3. Create a debt between them for the minimum of their amounts
      // 4. Update their balances and repeat until no more debts can be created
      while (
        Object.keys(balances).length > 0 &&
        Object.keys(balances).length > 1
      ) {
        // Find person owed the most money (highest positive balance)
        const maxOwed = Object.keys(balances).reduce((a, b) =>
          (balances[a] ?? 0) > (balances[b] ?? 0) ? a : b,
        );
        // Find person who owes the most money (lowest negative balance)
        const maxOwing = Object.keys(balances).reduce((a, b) =>
          (balances[a] ?? 0) < (balances[b] ?? 0) ? a : b,
        );
        // Take the minimum of the two amounts to create a debt
        const amount = Math.min(
          Math.abs(balances[maxOwed] ?? 0),
          Math.abs(balances[maxOwing] ?? 0),
        );

        // Only create debt if amount is positive
        if (amount > 0) {
          debts.push({
            from: maxOwing,
            to: maxOwed,
            amount,
          });
        }

        // Update balances after creating the debt
        balances[maxOwed] = (balances[maxOwed] ?? 0) - amount;
        balances[maxOwing] = (balances[maxOwing] ?? 0) + amount;

        // Remove members whose balance is now zero
        if (balances[maxOwed] === 0) delete balances[maxOwed];
        if (balances[maxOwing] === 0) delete balances[maxOwing];
      }

      // Store the simplified debts in the database
      for (const debt of debts) {
        await tx.simplifiedDebt.create({
          data: {
            fromId: debt.from,
            toId: debt.to,
            amount: debt.amount,
            groupId,
          },
        });
      }

      // Update last calculation timestamp if this is a manual update
      if (isManualUpdate) {
        await tx.group.update({
          where: { id: groupId },
          data: {
            lastCacluatedDebtsAt: new Date(),
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
    const paidBy = payment.groupMemberId;
    const amount = payment.amount;

    if (!balances[paidBy]) balances[paidBy] = 0;
    balances[paidBy] += amount;
  }

  // Add negative balance for expense splits (amounts owed)
  for (const split of splits) {
    const owes = split.groupMemberId;
    const amount = split.amount;

    if (!balances[owes]) balances[owes] = 0;
    balances[owes] -= amount;
  }

  // Process settlements (direct transfers between members)
  for (const settlement of settlements) {
    const paidBy = settlement.fromId;
    const receivedBy = settlement.toId;
    const amount = settlement.amount;

    if (!balances[paidBy]) balances[paidBy] = 0;
    if (!balances[receivedBy]) balances[receivedBy] = 0;
    balances[paidBy] += amount;
    balances[receivedBy] -= amount;
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
    if (!!debt.amount) {
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

  // Update last calculation timestamp for manual updates
  if (isManualUpdate)
    await tx.group.update({
      where: { id: groupId },
      data: {
        lastCacluatedDebtsAt: new Date(),
      },
    });

  return { success: "Simplified debts calculated and stored" };
}
