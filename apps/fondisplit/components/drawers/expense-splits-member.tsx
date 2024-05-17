"use client";

import { useExpenseDetails } from "@fondingo/store/fondisplit";
import { Avatar } from "@fondingo/ui/avatar";
import { Input } from "@fondingo/ui/input";
import { IndianRupee } from "@fondingo/ui/lucide";
import { Dispatch, SetStateAction, useCallback } from "react";

interface IProps {
  userId: string;
  userName: string;
  userImageUrl: string | null | undefined;
  setSplitsState: Dispatch<
    SetStateAction<
      {
        userId: string;
        userName: string;
        amount: number;
      }[]
    >
  >;
}

export function ExpenseSplitsMember({
  userId,
  userName,
  userImageUrl,
  setSplitsState,
}: IProps) {
  const { onSplitsDrawerClose, splitType, splits, expenseAmount, setSplits } =
    useExpenseDetails();

  const handleSinglePayer = useCallback(
    ({ userId, userName }: { userId: string; userName: string }) => {
      setSplits([
        {
          userId,
          userName,
          amount: expenseAmount,
        },
      ]);
    },
    [setSplits, expenseAmount],
  );

  return (
    <li
      onClick={() => {}}
      className="flex cursor-pointer items-center justify-between border-b pb-2"
    >
      <div className="flex items-center">
        <Avatar userImageUrl={userImageUrl} userName={userName} />
        <p className="ml-4">{userName}</p>
      </div>
      {splitType === "custom" && (
        <div className="flex items-center">
          <IndianRupee className="text-muted-foreground mr-2 h-4 w-4" />
          <Input
            type="number"
            defaultValue={
              splits.length > 1
                ? splits.find((split) => split.userId === userId)?.amount === 0
                  ? ""
                  : splits.find((split) => split.userId === userId)?.amount
                : ""
            }
            onChange={(e) => {
              setSplitsState((prev) =>
                prev
                  .filter((split) => split.userId !== userId)
                  .concat([
                    {
                      userId,
                      userName,
                      amount: Number(e.target.value),
                    },
                  ]),
              );
            }}
            className="form-input w-20"
          />
        </div>
      )}
    </li>
  );
}
