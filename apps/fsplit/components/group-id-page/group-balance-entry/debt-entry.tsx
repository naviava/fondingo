"use client";

import { useRouter } from "next/navigation";
import { memo } from "react";

import { TCurrencyCode } from "@fondingo/db-split";
import { cn } from "@fondingo/ui/utils";

import { DisplayAmount } from "~/components/display-amount";
import { Button } from "@fondingo/ui/button";
import { Avatar } from "@fondingo/ui/avatar";

interface IProps {
  groupId: string;
  from: {
    id: string;
    name: string;
    image: string | null | undefined;
  };
  to: {
    id: string;
    name: string;
    image: string | null | undefined;
  };
  amount: number;
  currency: TCurrencyCode;
  isDebt?: boolean;
}

export const DebtEntry = memo(_DebtEntry);
function _DebtEntry({
  groupId,
  from,
  to,
  currency,
  amount,
  isDebt = false,
}: IProps) {
  const router = useRouter();

  return (
    <li>
      <div className="flex items-center gap-x-2">
        <Avatar variant="sm" userName={from.name} userImageUrl={from.image} />
        <div className="text-muted-foreground flex items-center gap-x-1 text-sm font-medium">
          <span>{from.name} owes </span>
          <div
            className={cn(
              "flex items-center font-semibold",
              isDebt ? "text-orange-600" : "text-cta",
            )}
          >
            <DisplayAmount variant="sm" amount={amount} currency={currency} />
          </div>
          <span> to {to.name}</span>
        </div>
      </div>
      <div className="ml-8 mt-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            router.push(
              `/groups/${groupId}/settlement?from=${from.id}&to=${to.id}&amount=${amount}`,
            )
          }
          className="text-muted-foreground hover:text-muted-foreground h-8 font-bold shadow-sm shadow-neutral-500 hover:bg-neutral-50"
        >
          Settle up
        </Button>
      </div>
    </li>
  );
}
