"use client";

import { TCurrencyCode } from "@fondingo/db-split";

import { DisplayAmount } from "~/components/display-amount";
import { Avatar } from "@fondingo/ui/avatar";

interface IProps {
  type: "payment" | "split";
  creditorName?: string;
  didIPay?: boolean;
  debtorName?: string;
  doIOwe?: boolean;
  amount: number;
  currency: TCurrencyCode;
  imageUrl?: string | null | undefined;
  avatarSize?: "default" | "sm" | "lg" | undefined;
}

export function PaymentSplitEntry({
  type,
  creditorName = "Unknown",
  didIPay,
  debtorName = "Unknown",
  doIOwe,
  amount,
  currency,
  imageUrl = "",
  avatarSize = "default",
}: IProps) {
  return (
    <li className="flex items-center gap-x-3 py-1 font-medium">
      <Avatar
        variant={avatarSize}
        userName={creditorName}
        userImageUrl={imageUrl}
      />
      <div className="flex items-center">
        {`${type === "payment" ? (didIPay ? "You paid" : creditorName + " paid") : doIOwe ? "You owe" : debtorName + " owes"}`}
        <DisplayAmount
          amount={amount}
          currency={currency}
          variant={avatarSize === "sm" ? "sm" : "default"}
          className="ml-1"
        />
      </div>
    </li>
  );
}
