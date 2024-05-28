import { RefreshButton } from "@fondingo/ui/refresh-button";
import { DisplayAmount } from "~/components/display-amount";
import { CurrencyCode } from "@fondingo/db-split";
import { DebtWithDetails } from "~/types";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/lib/utils";
import { ScrollArea } from "@fondingo/ui/scroll-area";

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
  const totalLength = myCredits.length + myDebts.length;
  const isEven = !myCredits.length && !myDebts.length;

  return (
    <div className="ml-[5.3rem]">
      <div className="flex items-center justify-between">
        <h1
          className={cn("line-clamp-1 text-xl font-semibold", hfont.className)}
        >
          {groupName}
        </h1>
        <RefreshButton />
      </div>
      {!hasExpenses && <p className="text-sm">No expenses here yet.</p>}
      {hasExpenses && !groupDebts.length && (
        <p className="text-base">All debts settled.</p>
      )}
      <ScrollArea className={cn("w-fit pr-6", totalLength > 3 && "h-[4.3rem]")}>
        <ul className="mt-2 w-fit space-y-1">
          {hasExpenses && isEven ? (
            <p className="text-muted-foreground flex items-center text-xs">
              You're all settled up.
            </p>
          ) : (
            !!myCredits.length &&
            myCredits.map((credit) => {
              return (
                <li
                  key={credit.id}
                  className="text-muted-foreground flex items-center text-xs"
                >
                  {credit.from.name} owes you{" "}
                  <DisplayAmount
                    variant="xs"
                    amount={credit.amount}
                    currency={currency}
                    className="text-cta ml-0.5 font-semibold"
                  />
                </li>
              );
            })
          )}
          {!!myDebts.length &&
            myDebts.map((debt) => {
              return (
                <li
                  key={debt.id}
                  className="text-muted-foreground flex items-center text-sm"
                >
                  You owe {debt.to.name}{" "}
                  <DisplayAmount
                    variant="sm"
                    amount={debt.amount}
                    currency={currency}
                    className="ml-0.5 font-semibold text-orange-600"
                  />
                </li>
              );
            })}
          {/* !!myCredits.length &&
          myCredits.slice(0, 3).map((credit, idx) => {
            if (idx === 2)
              return (
                <p className="text-muted-foreground flex items-center justify-end text-xs">
                  ...and {totalLength - 2} more
                </p>
              );
            return (
              <li
                key={credit.id}
                className="text-muted-foreground flex items-center text-xs"
              >
                {credit.from.name} owes you{" "}
                <DisplayAmount
                  variant="xs"
                  amount={credit.amount}
                  currency={currency}
                  className="text-cta ml-0.5 font-semibold"
                />
              </li>
            );
          })
        )}
        {!!myDebts.length &&
          myDebts
            .slice(0, Math.max(0, 3 - myCredits.length))
            .map((debt, idx) => {
              if (idx === 2 - myCredits.length)
                return (
                  <p className="text-muted-foreground flex items-center justify-end text-xs">
                    ...and {totalLength - 2} more
                  </p>
                );
              return (
                <li
                  key={debt.id}
                  className="text-muted-foreground flex items-center text-sm"
                >
                  You owe {debt.to.name}{" "}
                  <DisplayAmount
                    variant="sm"
                    amount={debt.amount}
                    currency={currency}
                    className="ml-0.5 font-semibold text-orange-600"
                  />
                </li>
              );
            })} */}
        </ul>
      </ScrollArea>
    </div>
  );
}
