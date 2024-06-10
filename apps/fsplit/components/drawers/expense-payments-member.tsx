"use client";

import { Dispatch, SetStateAction, useCallback, useMemo } from "react";

import { useExpenseDetails } from "@fondingo/store/fsplit";
import { Avatar } from "@fondingo/ui/avatar";
import { Check } from "@fondingo/ui/lucide";
import { Input } from "@fondingo/ui/input";

import { currencyIconMap } from "@fondingo/ui/constants";
import { cn } from "@fondingo/ui/utils";

interface IProps {
  userId: string;
  userName: string;
  userImageUrl: string | null | undefined;
  isMultiple: boolean;
  setPaymentsState: Dispatch<
    SetStateAction<
      {
        userId: string;
        userName: string;
        amount: number;
      }[]
    >
  >;
}

export function ExpensePaymentsMember({
  userId,
  userName,
  userImageUrl,
  isMultiple,
  setPaymentsState,
}: IProps) {
  const {
    onPaymentsDrawerClose,
    payments,
    setPayments,
    expenseAmount,
    currency,
  } = useExpenseDetails();

  const CurrencyIcon = useMemo(
    () => currencyIconMap[currency].icon,
    [currency],
  );

  const handleSinglePayer = useCallback(
    ({ userId, userName }: { userId: string; userName: string }) => {
      setPayments([
        {
          userId,
          userName,
          amount: Math.floor(Number(expenseAmount) * 100) / 100,
        },
      ]);
    },
    [setPayments, expenseAmount],
  );

  return (
    <li
      onClick={() => {
        if (!isMultiple) {
          handleSinglePayer({ userId, userName });
          onPaymentsDrawerClose();
        }
        return;
      }}
      className={cn(
        "flex items-center justify-between border-b pb-2",
        !isMultiple && "cursor-pointer",
      )}
    >
      <div className="flex items-center">
        <Avatar userImageUrl={userImageUrl} userName={userName} />
        <p
          className={cn(
            "ml-4",
            !isMultiple &&
              payments.length === 1 &&
              payments[0]?.userName === userName &&
              "font-semibold",
          )}
        >
          {userName}
        </p>
      </div>
      {!isMultiple &&
        payments.length === 1 &&
        payments[0]?.userName === userName && <Check className="text-cta" />}
      {isMultiple && (
        <div className="flex items-center">
          <CurrencyIcon className="text-muted-foreground mr-2 h-4 w-4" />
          <Input
            type="number"
            defaultValue={
              payments.length > 1
                ? payments.find((payment) => payment.userId === userId)
                    ?.amount === 0
                  ? ""
                  : payments.find((payment) => payment.userId === userId)
                      ?.amount
                : ""
            }
            onChange={(e) => {
              setPaymentsState((prev) =>
                prev
                  .filter((payment) => payment.userId !== userId)
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
