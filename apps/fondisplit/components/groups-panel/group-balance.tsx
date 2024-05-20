import { IndianRupee } from "@fondingo/ui/lucide";
import { DebtWithDetails } from "~/types";
import { cn } from "@fondingo/ui/utils";

interface IProps {
  userId: string;
  data: DebtWithDetails[];
}

export function GroupBalance({ userId, data }: IProps) {
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
        isInDebt ? "text-rose-700" : "text-cta",
      )}
    >
      <span className="text-xs font-medium md:text-sm">
        {isInDebt ? "you owe" : "you are owed"}
      </span>
      <div className="flex items-center">
        <IndianRupee className="mr-1 h-4 w-4" />
        <span className="font-semibold">
          {(isInDebt
            ? (grossBalanceAmount / 100) * -1
            : grossBalanceAmount / 100
          ).toFixed(2)}
        </span>
      </div>
    </div>
  );
}
