import { currencyIconMap } from "@fondingo/ui/constants";
import { ExpenseAvatar } from "../expense-avatar";
import { CurrencyCode } from "@fondingo/db-split";

import { serverClient } from "~/lib/trpc/server-client";
import { EntryDate } from "./entry-date";
import { cn } from "@fondingo/ui/utils";

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
  const CurrencyIcon = currencyIconMap[currency].icon;
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
        <h5 className="line-clamp-1 font-semibold">{expense.name}</h5>
        {expense.payments.map((payment, idx) => {
          if (idx > 1) return;
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
                <CurrencyIcon className="ml-1 h-3 w-3" />
                <span>{(payment.amount / 100).toLocaleString()}</span>
                {idx === 1 && expense.payments.length > 2 && (
                  <span className="ml-1">{`and ${expense.payments.length - 2} more`}</span>
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
          <div className="flex items-center">
            <CurrencyIcon className="h-4 w-4" />
            <span className="font-semibold">{displayText.amount}</span>
          </div>
        </div>
      ) : (
        <span className="text-xs font-medium italic text-neutral-400">
          all settled up
        </span>
      )}
    </div>
  );
}
