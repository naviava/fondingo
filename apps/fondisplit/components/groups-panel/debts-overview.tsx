import { currencyIconMap } from "@fondingo/ui/constants";
import { serverClient } from "~/lib/trpc/server-client";
import { CurrencyCode } from "@fondingo/db-split";

interface IProps {
  userId: string;
  groupId: string;
  currency: CurrencyCode;
}

export async function DebtsOverview({ userId, groupId, currency }: IProps) {
  const allMyBalances = await serverClient.group.getDebts(groupId);

  const CurrencyIcon = currencyIconMap[currency].icon;
  const myCredits = allMyBalances.filter(
    (credit) => credit.to.user?.id === userId,
  );
  const myDebts = allMyBalances.filter((debt) => debt.from.user?.id === userId);

  return (
    <div className="space-y-1.5">
      {myCredits.map((credit) => (
        <div
          key={credit.id}
          className="text-muted-foreground flex items-center text-sm font-medium"
        >
          {credit.from.name} owes you{" "}
          <div className="text-cta ml-1 flex items-center">
            <CurrencyIcon size={11} />
            <span className="font-semibold">
              {(credit.amount / 100).toFixed(2)}
            </span>
          </div>
        </div>
      ))}
      {myDebts.map((debt) => (
        <div
          key={debt.id}
          className="text-muted-foreground flex items-center text-sm font-medium"
        >
          You owe {debt.to.name}
          <div className="ml-1 flex items-center text-orange-600">
            <CurrencyIcon size={11} />
            <span className="font-semibold">
              {(debt.amount / 100).toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
