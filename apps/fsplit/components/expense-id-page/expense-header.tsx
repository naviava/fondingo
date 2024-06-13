"use client";

import { ExpenseAvatar } from "../expense-avatar";
import { TCurrencyCode } from "@fondingo/db-split";
import { DisplayAmount } from "../display-amount";
import { formatDate } from "@fondingo/utils/date-fns-tz";

interface IProps {
  groupColor: string;
  currency: TCurrencyCode;
  expenseName: string;
  expenseAmount: number;
  createdAt: Date;
  updatedAt: Date;
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
  const createdAtString = formatDate(createdAt, "d MMMM yyyy");
  const updatedAtString = formatDate(updatedAt, "d MMMM yyyy");

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
          <p className="">{`Added by ${expenseCreator} on ${createdAtString}`}</p>
          <p className="">{`Last updated ${expenseUpdatedBy} on ${updatedAtString}`}</p>
        </div>
      </div>
    </div>
  );
}
