import { serverClient } from "~/lib/trpc/server-client";
import { CurrencyCode } from "@fondingo/db-split";
import { Expense } from "./expense";

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

  return (
    <div className="space-y-6 px-4">
      {expenses?.map((expense) => (
        <Expense
          key={expense.id}
          userId={userId}
          expenseId={expense.id}
          groupId={groupId}
          groupColor={groupColor}
          currency={currency}
        />
      ))}
    </div>
  );
}
