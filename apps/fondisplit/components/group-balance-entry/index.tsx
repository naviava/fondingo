import { currencyIconMap } from "@fondingo/ui/constants";
import { Separator } from "@fondingo/ui/separator";
import { CurrencyCode } from "@fondingo/db-split";
import { Avatar } from "@fondingo/ui/avatar";

import { serverClient } from "~/lib/trpc/server-client";
import { cn } from "@fondingo/ui/utils";

interface IProps {
  groupId: string;
  memberId: string;
  currency: CurrencyCode;
}

export async function GroupBalanceEntry({
  groupId,
  memberId,
  currency,
}: IProps) {
  const {
    member,
    debts,
    credits,
    totalDebt,
    totalCredit,
    grossBalance,
    isInDebt,
  } = await serverClient.group.getDebtsByMemberId({ groupId, memberId });

  const CurrencyIcon = currencyIconMap[currency].icon;
  const displayAmount = isInDebt ? -grossBalance : grossBalance;

  return (
    <>
      <li className="flex items-center gap-x-4 px-4 text-sm">
        <Avatar userName={member?.name} userImageUrl={member?.user?.image} />
        <div className="flex items-center gap-x-1 font-medium">
          <span className="font-bold">{member?.name}</span>
          <span>{isInDebt ? "owes" : "gets back"}</span>
          <div
            className={cn(
              "flex items-center font-semibold",
              isInDebt ? "text-orange-600" : "text-cta",
            )}
          >
            <CurrencyIcon className="h-3 w-3" />
            <span>{(displayAmount / 100).toFixed(2)}</span>
          </div>
          <span>in total</span>
        </div>
      </li>
      <Separator className="my-4" />
    </>
  );
}
