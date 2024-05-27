import { currencyIconMap } from "@fondingo/ui/constants";
import { ExpenseAvatar } from "../expense-avatar";
import { CurrencyCode } from "@fondingo/db-split";

interface IProps {
  groupColor: string;
  currency: CurrencyCode;
  expenseName: string;
  expenseAmount: number;
  createdAt: string;
  updatedAt: string;
  expenseCreator: string;
  expenseUpdatedBy: string;
}

export function ExpenseHeader({
  groupColor,
  currency,
  expenseName,
  expenseAmount,
  createdAt,
  updatedAt,
  expenseCreator,
  expenseUpdatedBy,
}: IProps) {
  const CurrencyIcon = currencyIconMap[currency].icon;

  return (
    <div className="mt-6 flex items-start gap-x-4 px-6">
      <ExpenseAvatar groupColor={groupColor} />
      <div className="space-y-1">
        <p className="text-lg font-medium">{expenseName}</p>
        <h1 className="flex items-center text-3xl font-bold">
          <CurrencyIcon className="h-7 w-7" />
          {(expenseAmount / 100).toLocaleString()}
        </h1>
        <div className="text-muted-foreground text-sm font-medium">
          <p className="">{`Added by ${expenseCreator} on ${createdAt}`}</p>
          <p className="">{`Last updated ${expenseUpdatedBy} on ${updatedAt}`}</p>
        </div>
      </div>
    </div>
  );
}
