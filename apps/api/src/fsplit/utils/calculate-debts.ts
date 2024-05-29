import splitdb from "@fondingo/db-split";

/**
 * This function is used to calculate and store the simplified debts for a group. It takes a string input representing the group ID.
 *
 * The function performs the following steps:
 * - It starts a transaction on the database.
 * - It deletes all existing simplified debts for the group.
 * - It retrieves all payments and splits associated with the group from the database.
 * - It retrieves all settlements associated with the group from the database.
 * - It calculates the net balance for each member of the group by adding the amounts they have paid and subtracting the amounts they owe.
 * - It subtracts the settled amounts from the balances.
 * - It simplifies the debts by repeatedly finding the member who owes the most and the member who is owed the most, and creating a debt from the former to the latter for the smaller of the two amounts. It updates the balances accordingly and removes any balances that have become zero.
 * - It stores the simplified debts in the database.
 * - If all operations are successful, it returns an object with a 'success' property and a message indicating that the simplified debts were calculated and stored.
 * - If any operation fails, it catches the error, logs it to the console, and returns an object with an 'error' property and a message indicating that there was an error calculating the simplified debts.
 *
 * @async
 * @function
 * @param {string} groupId - The ID of the group.
 * @returns {Promise<{ success: string } | { error: string }>} A promise that resolves to an object with either a 'success' or 'error' property.
 * @throws {Error} If there is an error calculating the simplified debts.
 */
export async function calculateDebts(
  groupId: string,
  isManualUpdate: boolean = false,
): Promise<{ success: string } | { error: string }> {
  "use server";

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
