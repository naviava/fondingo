import { DisplayAmount } from "~/components/display-amount";
import { TCurrencyCode, TSimplifiedDebt } from "@fondingo/db-split";
import { DebtWithDetails } from "~/types";
import { cn } from "@fondingo/ui/utils";

type IProps = {
  userId: string;
  currency: TCurrencyCode;
  data: (TSimplifiedDebt & {
    from: { userId: string | null };
    to: { userId?: string | null };
  })[];
};

export function GroupBalance({ userId, currency, data }: IProps) {
  const grossBalanceAmount = data.reduce((acc, debt) => {
    if (debt.from.userId === userId) {
      acc -= debt.amount;
    }
    if (debt.to.userId === userId) {
      acc += debt.amount;
    }
    return acc;
  }, 0);

  const isInDebt = grossBalanceAmount < 0;

  if (grossBalanceAmount === 0) {
    return <div className="text-xs font-semibold md:text-sm">settled up</div>;
  }

  return (
    <div
      className={cn(
        "flex flex-col items-end justify-center",
        isInDebt ? "text-orange-600" : "text-cta",
      )}
    >
      <span className="text-xs font-medium md:text-sm">
        {isInDebt ? "you owe" : "you are owed"}
      </span>
      <DisplayAmount
        amount={grossBalanceAmount}
        currency={currency}
        className="font-semibold"
      />
    </div>
  );
}
