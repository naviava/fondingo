import { DisplayAmount } from "~/components/display-amount";
import { serverClient } from "~/lib/trpc/server-client";
import { TCurrencyCode } from "@fondingo/db-split";

function MoreBalances({ totalLength }: { totalLength: number }) {
  return (
    <p className="text-muted-foreground text-xs italic">
      plus {totalLength - 2} more balances
    </p>
  );
}

function ListItem({
  id,
  name,
  amount,
  currency,
  isCredit,
}: {
  id: string;
  name: string;
  amount: number;
  isCredit: boolean;
  currency: TCurrencyCode;
}) {
  return (
    <li
      key={id}
      className="text-muted-foreground flex items-center text-sm font-medium"
    >
      {isCredit ? `${name} owes you ` : `You owe ${name}`}
      <DisplayAmount
        variant="sm"
        amount={amount}
        currency={currency}
        className={`ml-1 font-semibold ${isCredit ? "text-cta" : "text-orange-600"}`}
      />
    </li>
  );
}

interface IProps {
  userId: string;
  groupId: string;
  currency: TCurrencyCode;
}

export async function DebtsOverview({ userId, groupId, currency }: IProps) {
  const allMyBalances = await serverClient.group.getDebts(groupId);

  const myCredits = allMyBalances.filter(
    (credit) => credit.to.user?.id === userId,
  );
  const myDebts = allMyBalances.filter((debt) => debt.from.user?.id === userId);
  const totalLength = myCredits.length + myDebts.length;

  return (
    <ul className="space-y-0.5">
      {myCredits.slice(0, 3).map((credit, idx) => {
        if (idx === 2 && totalLength > 3)
          return <MoreBalances key={credit.id} totalLength={totalLength} />;
        return (
          <ListItem
            key={credit.id}
            id={credit.id}
            name={credit.from.name}
            amount={credit.amount}
            currency={currency}
            isCredit={true}
          />
        );
      })}
      {myDebts.slice(0, Math.max(0, 3 - myCredits.length)).map((debt, idx) => {
        if (idx === 2 - myCredits.length && totalLength > 3)
          return <MoreBalances key={debt.id} totalLength={totalLength} />;
        return (
          <ListItem
            key={debt.id}
            id={debt.id}
            name={debt.to.name}
            amount={debt.amount}
            currency={currency}
            isCredit={false}
          />
        );
      })}
    </ul>
  );
}
