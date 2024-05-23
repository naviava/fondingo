import { serverClient } from "~/lib/trpc/server-client";
import { CurrencyCode } from "@fondingo/db-split";
import { Expense } from "./expense";
import Link from "next/link";

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
    <div>
      {expenses?.map((expense) => (
        <Link
          key={expense.id}
          href={`/groups/${groupId}/expense/${expense.id}`}
        >
          <Expense
            key={expense.id}
            userId={userId}
            expenseId={expense.id}
            groupId={groupId}
            groupColor={groupColor}
            currency={currency}
          />
        </Link>
      ))}
    </div>
  );
}
