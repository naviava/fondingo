import { currencyIconMap } from "@fondingo/ui/constants";
import { CurrencyCode } from "@fondingo/db-split";
import { DebtWithDetails } from "~/types";
import { RefreshButton } from "@fondingo/ui/refresh-button";

interface IProps {
  userId: string | undefined;
  groupName: string;
  currency: CurrencyCode;
  hasExpenses: boolean;
  groupDebts: DebtWithDetails[];
}

export function GroupHeader({
  userId,
  groupName,
  currency,
  hasExpenses,
  groupDebts,
}: IProps) {
  const myCredits = groupDebts.filter((credit) => credit.to.userId === userId);
  const myDebts = groupDebts.filter((credit) => credit.from.userId === userId);

  const isEven = !myCredits.length && !myDebts.length;
  const CurrencyIcon = currencyIconMap[currency].icon;

  return (
    <div className="ml-[5.3rem]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{groupName}</h1>
        <RefreshButton />
      </div>
      {!hasExpenses && <p className="text-base">No expenses here yet.</p>}
      {hasExpenses && !groupDebts.length && (
        <p className="text-base">All debts settled.</p>
      )}
      <ul className="mt-2 space-y-1">
        {hasExpenses && isEven ? (
          <p className="text-muted-foreground flex items-center text-sm">
            You're all settled up.
          </p>
        ) : (
          !!myCredits.length &&
          myCredits.map((credit) => (
            <li
              key={credit.id}
              className="text-muted-foreground flex items-center text-sm"
            >
              {credit.from.name} owes you{" "}
              <div className="text-cta ml-0.5 flex items-center">
                <CurrencyIcon className="h-3 w-3" />
                <span className="font-semibold">
                  {(credit.amount / 100).toLocaleString()}
                </span>
              </div>
            </li>
          ))
        )}
        {!!myDebts.length &&
          myDebts.map((debt) => (
            <li
              key={debt.id}
              className="text-muted-foreground flex items-center text-sm"
            >
              You owe {debt.to.name}{" "}
              <div className="ml-0.5 flex items-center text-orange-600">
                <CurrencyIcon className="h-3 w-3" />
                <span className="font-semibold">
                  {(debt.amount / 100).toLocaleString()}
                </span>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
