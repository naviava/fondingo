"use server";

import splitdb from "@fondingo/db-split";

export async function calculateDebts(
  groupId: string,
  isManualUpdate: boolean = false,
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
        const paidBy = settlement.fromId;
        const receivedBy = settlement.toId;
        const amount = settlement.amount;

        if (!balances[paidBy]) balances[paidBy] = 0;
        if (!balances[receivedBy]) balances[receivedBy] = 0;
        balances[paidBy] += amount;
        balances[receivedBy] -= amount;
      }

      // Simplify debts
      const debts: {
        from: string;
        to: string;
        amount: number;
      }[] = [];

      while (
        Object.keys(balances).length > 0 &&
        Object.keys(balances).length > 1
      ) {
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
        if (!!debt.amount) {
          await db.simplifiedDebt.create({
            data: {
              fromId: debt.from,
              toId: debt.to,
              amount: debt.amount,
              groupId,
            },
          });
        }
      }

      if (isManualUpdate)
        await db.group.update({
          where: { id: groupId },
          data: {
            lastCacluatedDebtsAt: new Date(),
          },
        });
      return { success: "Simplified debts calculated and stored" };
    });
  } catch (err) {
    console.error("\n\nError calculating simplified debts:\n\n", err);
    return { error: "Error calculating simplified debts" };
  }
}
