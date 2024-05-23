import { currencyIconMap } from "@fondingo/ui/constants";
import { ExpenseWallet } from "../expense-wallet";
import { CurrencyCode } from "@fondingo/db-split";

interface IProps {
  groupColor: string;
  currency: CurrencyCode;
  expenseName: string;
  expenseCreator: string;
  expenseAmount: number;
  createdAt: string;
  updatedAt: string;
}

export function ExpenseHeader({
  groupColor,
  currency,
  expenseName,
  expenseCreator,
  expenseAmount,
  createdAt,
  updatedAt,
}: IProps) {
  const CurrencyIcon = currencyIconMap[currency].icon;

  return (
    <div className="mt-6 flex items-start gap-x-4 px-6">
      <ExpenseWallet groupColor={groupColor} />
      <div className="space-y-1">
        <p className="text-lg font-medium">{expenseName}</p>
        <h1 className="flex items-center text-3xl font-bold">
          <CurrencyIcon className="h-7 w-7" />
          {(expenseAmount / 100).toFixed(2)}
        </h1>
        <div className="text-muted-foreground text-sm font-medium">
          <p className="">{`Added by ${expenseCreator} on ${createdAt}`}</p>
          <p className="">{`Last updated on ${updatedAt}`}</p>
        </div>
      </div>
    </div>
  );
}
