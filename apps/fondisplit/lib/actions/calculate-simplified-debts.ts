"use server";

import prisma from "@fondingo/db-split";
import splitdb from "@fondingo/db-split";

/**
 * Calculates and stores simplified debts for all users in a specific group.
 *
 * This function performs the following steps:
 * 1. Fetches all expense payments and splits for a specific group from the database.
 * 2. Calculates the net balance for each user in the group by subtracting the amount they paid and adding the amount they owe.
 * 3. Simplifies the debts by repeatedly finding the user who owes the most and the user who is owed the most within the group, and creating a debt from the former to the latter.
 * 4. Stores the simplified debts in the database.
 *
 * @async
 * @function
 * @param {string} groupId - The ID of the group for which to calculate simplified debts.
 * @returns {Promise<{message: string} | void>} A Promise that resolves with a success message when all simplified debts have been stored in the database, or an object with an error message if an error occurred.
 * @throws {Error} Throws an error if there is a problem communicating with the database.
 */
export async function calculateSimplifiedDebts(
  groupId: string,
): Promise<{ message: string } | void> {
  try {
    // Calculate net balances.
    const payments = await splitdb.expensePayment.findMany({
      where: {
        expense: { groupId },
      },
      include: { expense: true },
    });
    const splits = await splitdb.expenseSplit.findMany({
      where: {
        expense: { groupId },
      },
      include: { expense: true },
    });

    const balances: { [key: string]: number } = {};
    for (const payment of payments) {
      const paidBy = payment.groupMemberId;
      const amount = payment.amount;

      if (!balances[paidBy]) balances[paidBy] = 0;
      balances[paidBy] -= amount;
    }

    for (const split of splits) {
      const owes = split.groupMemberId;
      const amount = split.amount;

      if (!balances[owes]) balances[owes] = 0;
      balances[owes] += amount;
    }

    // Simplify debts
    const debts: {
      from: string;
      to: string;
      amount: number;
    }[] = [];

    while (Object.keys(balances).length > 0) {
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
      await prisma.simplifiedDebt.create({
        data: {
          fromId: debt.from,
          toId: debt.to,
          amount: debt.amount,
          groupId,
        },
      });
    }
    return { message: "Simplified debts calculated and stored" };
  } catch (err) {
    console.error("\n\nError calculating simplified debts:\n\n", err);
    return { message: "Error calculating simplified debts" };
  }
}
