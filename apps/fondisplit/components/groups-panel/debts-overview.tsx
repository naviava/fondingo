import { DisplayAmount } from "~/components/display-amount";
import { serverClient } from "~/lib/trpc/server-client";
import { CurrencyCode } from "@fondingo/db-split";

interface IProps {
  userId: string;
  groupId: string;
  currency: CurrencyCode;
}

export async function DebtsOverview({ userId, groupId, currency }: IProps) {
  const allMyBalances = await serverClient.group.getDebts(groupId);

  const myCredits = allMyBalances.filter(
    (credit) => credit.to.user?.id === userId,
  );
  const myDebts = allMyBalances.filter((debt) => debt.from.user?.id === userId);

  return (
    <ul className="space-y-1.5">
      {myCredits.map((credit) => (
        <li
          key={credit.id}
          className="text-muted-foreground flex items-center text-sm font-medium"
        >
          {credit.from.name} owes you{" "}
          <DisplayAmount
            variant="sm"
            amount={credit.amount}
            currency={currency}
            className="text-cta ml-1 font-semibold"
          />
        </li>
      ))}
      {myDebts.map((debt) => (
        <li
          key={debt.id}
          className="text-muted-foreground flex items-center text-sm font-medium"
        >
          You owe {debt.to.name}
          <DisplayAmount
            variant="sm"
            amount={debt.amount}
            currency={currency}
            className="ml-1 font-semibold text-orange-600"
          />
        </li>
      ))}
    </ul>
  );
}
