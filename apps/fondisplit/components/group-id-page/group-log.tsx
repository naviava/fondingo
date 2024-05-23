import Link from "next/link";

import { serverClient } from "~/lib/trpc/server-client";
import { SettlementEntry } from "./settlement-entry";
import { CurrencyCode } from "@fondingo/db-split";
import { ExpenseEntry } from "./expense-entry";

interface IProps {
  userId: string | undefined;
  groupId: string;
  groupColor: string;
  currency: CurrencyCode;
}

export async function GroupLog({
  userId,
  groupId,
  groupColor,
  currency,
}: IProps) {
  const expenses = await serverClient.expense.getExpenseIds(groupId);
  const settlements = await serverClient.expense.getSettlements(groupId);

  const expensesWithType = expenses.map((expense) => ({
    ...expense,
    type: "expense",
  }));
  const settlementsWithType = settlements.map((settlement) => ({
    ...settlement,
    type: "settlement",
  }));

  const allEntries = [...expensesWithType, ...settlementsWithType].sort(
    (a, b) => Number(b.createdAt) - Number(a.createdAt),
  );

  return (
    <div>
      {allEntries?.map((entry) => {
        if (entry.type === "expense") {
          const expense = expenses.find((e) => e.id === entry.id);
          if (!expense) return null;
          return (
            <Link
              key={expense.id}
              href={`/groups/${groupId}/expense/${expense.id}`}
            >
              <ExpenseEntry
                key={expense.id}
                userId={userId}
                expenseId={expense.id}
                groupId={groupId}
                groupColor={groupColor}
                currency={currency}
              />
            </Link>
          );
        }

        if (entry.type === "settlement") {
          const settlement = settlements.find((s) => s.id === entry.id);
          if (!settlement) return null;
          return (
            <Link
              key={settlement.id}
              href={`/groups/${groupId}/settlement/${settlement.id}`}
            >
              <SettlementEntry
                currency={currency}
                amount={settlement.amount}
                createdAt={settlement.createdAt}
                fromName={settlement.from.name}
                toName={settlement.to.name}
              />
            </Link>
          );
        }
      })}
    </div>
  );
}
