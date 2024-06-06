import { ExpenseAvatar } from "../expense-avatar";
import { CurrencyCode } from "@fondingo/db-split";
import { DisplayAmount } from "../display-amount";

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
  return (
    <div className="mt-6 flex items-start gap-x-4 px-6">
      <ExpenseAvatar groupColor={groupColor} />
      <div className="space-y-1">
        <p className="line-clamp-2 text-lg font-medium">{expenseName}</p>
        <DisplayAmount
          variant="xl"
          amount={expenseAmount}
          currency={currency}
          className="font-bold"
        />
        <div className="text-muted-foreground text-sm font-medium">
          <p className="">{`Added by ${expenseCreator} on ${createdAt}`}</p>
          <p className="">{`Last updated ${expenseUpdatedBy} on ${updatedAt}`}</p>
        </div>
      </div>
    </div>
  );
}
