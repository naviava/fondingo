import { currencyIconMap } from "@fondingo/ui/constants";
import { Separator } from "@fondingo/ui/separator";
import { CurrencyCode } from "@fondingo/db-split";
import { Avatar } from "@fondingo/ui/avatar";
import { DebtEntry } from "./debt-entry";

import { serverClient } from "~/lib/trpc/server-client";
import { cn } from "@fondingo/ui/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@fondingo/ui/accordion";

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
  const { member, debts, credits, isInDebt, grossBalance } =
    await serverClient.group.getDebtsByMemberId({ groupId, memberId });

  const CurrencyIcon = currencyIconMap[currency].icon;
  const displayAmount = isInDebt ? -grossBalance : grossBalance;

  if (!grossBalance) return null;

  return (
    <li>
      <Accordion type="single" collapsible defaultValue={`item-${memberId}`}>
        <AccordionItem value={`item-${memberId}`}>
          <AccordionTrigger className="pb-1 pr-4 pt-2">
            <div className="flex items-center gap-x-4 px-4 text-sm">
              <Avatar
                userName={member?.name}
                userImageUrl={member?.user?.image}
              />
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
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="ml-[4.5rem] space-y-4">
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
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {/* <Separator className="my-4" /> */}
    </li>
  );
}
