"use client";

import { Dispatch, SetStateAction, useCallback, useMemo } from "react";

import { useExpenseDetails } from "@fondingo/store/fsplit";
import { Check, IndianRupee } from "@fondingo/ui/lucide";
import { Avatar } from "@fondingo/ui/avatar";
import { Input } from "@fondingo/ui/input";

import { adjustMinorAmount } from "~/lib/utils";
import { cn } from "@fondingo/ui/utils";
import { currencyIconMap } from "@fondingo/ui/constants";

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
  const { splitType, splits, expenseAmount, setSplits, currency } =
    useExpenseDetails();

  const CurrencyIcon = useMemo(
    () => currencyIconMap[currency].icon,
    [currency],
  );

  const isInSplits = useMemo(
    () => splits.find((split) => split.userId === userId),
    [splits, userId],
  );

  const handleClick = useCallback(
    ({ userId, userName }: { userId: string; userName: string }) => {
      if (splitType === "custom") return;

      const existingEntry = splits.find((split) => split.userId === userId);

      const tempSplits = !!existingEntry
        ? splits.filter((split) => split.userId !== userId)
        : [...splits, { userId, userName, amount: 0 }];

      const newSplits = tempSplits.map((split) => ({
        ...split,
        amount: expenseAmount / tempSplits.length,
      }));

      const adjustedSplits = adjustMinorAmount(newSplits, expenseAmount);
      return setSplits(adjustedSplits);
    },
    [splitType, splits, expenseAmount, setSplits],
  );

  return (
    <li
      onClick={() => handleClick({ userId, userName })}
      className={cn(
        "flex items-center justify-between border-b pb-2",
        splitType === "equally" && "cursor-pointer",
      )}
    >
      <div className="flex items-center">
        <Avatar userImageUrl={userImageUrl} userName={userName} />
        <p className="ml-4">{userName}</p>
      </div>
      {splitType === "equally" && (
        <div
          className={cn(
            "flex h-6 w-6 items-center justify-center rounded-full border-2",
            isInSplits && "border-cta bg-cta",
          )}
        >
          {isInSplits && <Check className="h-4 w-4 text-white" />}
        </div>
      )}
      {splitType === "custom" && (
        <div className="flex items-center">
          <CurrencyIcon className="text-muted-foreground mr-2 h-4 w-4" />
          <Input
            type="number"
            min={0.01}
            step={0.01}
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
                      amount: Math.floor(Number(e.target.value) * 100) / 100,
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
