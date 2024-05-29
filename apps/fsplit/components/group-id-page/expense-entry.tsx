import { serverClient } from "~/lib/trpc/server-client";
import { CurrencyCode } from "@fondingo/db-split";
import { cn } from "@fondingo/ui/utils";

import { ExpenseAvatar } from "~/components/expense-avatar";
import { DisplayAmount } from "~/components/display-amount";
import { EntryDate } from "./entry-date";

interface IProps {
  userId: string | undefined;
  expenseId: string;
  groupId: string;
  groupColor: string;
  currency: CurrencyCode;
}

export async function ExpenseEntry({
  userId,
  expenseId,
  groupId,
  groupColor,
  currency,
}: IProps) {
  const expense = await serverClient.expense.getExpenseById({
    groupId,
    expenseId,
  });

  const paidByMe = expense.payments.reduce((acc, payment) => {
    if (payment.groupMember.userId === userId) {
      return acc + payment.amount;
    }
    return acc;
  }, 0);
  const owedByMe = expense.splits.reduce((acc, split) => {
    if (split.groupMember.userId === userId) {
      return acc + split.amount;
    }
    return acc;
  }, 0);

  const grossBalance = paidByMe - owedByMe;
  const isInDebt = grossBalance < 0;

  const displayText = {
    className: isInDebt ? "text-orange-600" : "text-cta",
    label: isInDebt ? "you borrowed" : "you lent",
    amount: isInDebt
      ? `${((grossBalance / 100) * -1).toLocaleString()}`
      : `${(grossBalance / 100).toLocaleString()}`,
  };

  return (
    <div
      role="button"
      className="mb-2 flex items-center gap-x-4 px-4 py-4 hover:bg-neutral-200"
    >
      <EntryDate createdAt={expense.createdAt} />
      <ExpenseAvatar groupColor={groupColor} />
      <div className="flex-1">
        <h5 className="line-clamp-1 font-medium">{expense.name}</h5>
        {expense.payments.map((payment, idx) => {
          if (idx > 0) return null;
          return (
            <div
              key={payment.id}
              className="text-muted-foreground flex items-center text-xs font-medium md:text-sm"
            >
              {payment.groupMember.userId === userId
                ? "You"
                : payment.groupMember.name}{" "}
              paid{" "}
              <div className="flex items-center">
                <DisplayAmount
                  variant="xs"
                  amount={payment.amount}
                  currency={currency}
                  className="ml-1"
                />
                {expense.payments.length > 1 && (
                  <span className="ml-1 line-clamp-1">{`and ${expense.payments.length - 1} more`}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {!!grossBalance ? (
        <div
          className={cn(
            "flex flex-col items-end justify-center",
            displayText.className,
          )}
        >
          <p className="text-xs font-medium md:text-sm">{displayText.label}</p>
          <DisplayAmount
            variant="sm"
            amount={grossBalance}
            currency={currency}
            className="font-semibold"
          />
        </div>
      ) : (
        <span className="text-xs font-medium italic text-neutral-400">
          all settled up
        </span>
      )}
    </div>
  );
}
