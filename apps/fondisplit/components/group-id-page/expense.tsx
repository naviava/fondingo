import { serverClient } from "~/lib/trpc/server-client";
import { format } from "@fondingo/utils/date-fns";
import { Wallet } from "@fondingo/ui/lucide";
import { CurrencyCode } from "@fondingo/db-split";
import { currencyIconMap } from "@fondingo/ui/constants";
import { hexToRgb } from "~/lib/utils";
import { cn } from "@fondingo/ui/utils";

interface IProps {
  userId: string | undefined;
  expenseId: string;
  groupId: string;
  groupColor: string;
  currency: CurrencyCode;
}

export async function Expense({
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
    className: isInDebt ? "text-rose-700" : "text-cta",
    label: isInDebt ? "you borrowed" : "you lent",
    amount: isInDebt
      ? `${((grossBalance / 100) * -1).toFixed(2)}`
      : `${(grossBalance / 100).toFixed(2)}`,
  };

  return (
    <div className="flex items-center gap-x-4">
      <div className="text-muted-foreground flex flex-col items-center justify-center text-sm font-medium">
        <p>{format(new Date(expense.createdAt), "LLL")}</p>
        <p>{format(new Date(expense.createdAt), "d")}</p>
      </div>
      <div
        className="p-3"
        style={{
          border: `2px solid ${hexToRgb(groupColor, 0.3)}`,
        }}
      >
        <Wallet className="h-6 w-6 text-rose-800 md:h-8 md:w-8" />
      </div>
      <div className="flex-1">
        <h5 className="line-clamp-1 text-sm font-semibold md:text-base">
          {expense.name}
        </h5>
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
              <div className="flex items-center space-x-1">
                <CurrencyIcon className="h-3 w-3" />
                <span>{(payment.amount / 100).toFixed(2)}</span>
                {idx === 1 && expense.payments.length > 2 && (
                  <span>{`and ${expense.payments.length - 2} more`}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
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
    </div>
  );
}
