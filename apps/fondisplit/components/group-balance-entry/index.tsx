import { currencyIconMap } from "@fondingo/ui/constants";
import { Separator } from "@fondingo/ui/separator";
import { CurrencyCode } from "@fondingo/db-split";
import { Avatar } from "@fondingo/ui/avatar";
import { DebtEntry } from "./debt-entry";

import { serverClient } from "~/lib/trpc/server-client";
import { cn } from "@fondingo/ui/utils";
import { group } from "console";

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

  if (!grossBalance) return null;

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
      <div className="ml-[4.5rem] mt-2 space-y-4">
        <>
          {credits.map((credit) => (
            <DebtEntry
              key={credit.id}
              groupId={groupId}
              from={{
                id: credit.fromId,
                name: credit.from.name,
                image: credit.from.user?.image,
              }}
              to={{
                id: credit.toId,
                name: credit.to.name,
                image: credit.to.user?.image,
              }}
              currency={currency}
              amount={credit.amount}
            />
          ))}
          {debts.map((debt) => (
            <DebtEntry
              key={debt.id}
              groupId={groupId}
              from={{
                id: debt.fromId,
                name: debt.from.name,
                image: debt.from.user?.image,
              }}
              to={{
                id: debt.toId,
                name: debt.to.name,
                image: debt.to.user?.image,
              }}
              currency={currency}
              amount={debt.amount}
              isDebt
            />
          ))}
        </>
      </div>
      <Separator className="my-4" />
    </>
  );
}
