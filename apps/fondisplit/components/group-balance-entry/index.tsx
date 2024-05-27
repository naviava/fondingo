"use client";

import { useLocalStorage } from "@fondingo/utils/hooks";
import { useCallback, useMemo } from "react";

import { currencyIconMap } from "@fondingo/ui/constants";
import { CurrencyCode } from "@fondingo/db-split";
import { Avatar } from "@fondingo/ui/avatar";
import { DebtEntry } from "./debt-entry";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@fondingo/ui/accordion";

import { trpc } from "~/lib/trpc/client";
import { cn } from "@fondingo/ui/utils";
import { DisplayAmount } from "../display-amount";

interface IProps {
  groupId: string;
  memberId: string;
  currency: CurrencyCode;
}

export function GroupBalanceEntry({ groupId, memberId, currency }: IProps) {
  const { data } = trpc.group.getDebtsByMemberId.useQuery({
    groupId,
    memberId,
  });

  const { member, debts, credits, grossBalance, isInDebt } = useMemo(
    () =>
      data || {
        member: null,
        debts: [],
        credits: [],
        grossBalance: 0,
        isInDebt: false,
      },
    [data],
  );
  const CurrencyIcon = useMemo(
    () => currencyIconMap[currency].icon,
    [currency],
  );
  const displayAmount = useMemo(
    () => (isInDebt ? -grossBalance : grossBalance),
    [isInDebt, grossBalance],
  );

  const [expanded, setExpanded] = useLocalStorage<Record<string, boolean>>(
    `accordion-group-balance-state`,
    {},
  );
  const toggleExpand = useCallback(
    (id: string) => {
      setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
    },
    [setExpanded],
  );

  if (!data || !grossBalance) return null;

  return (
    <li>
      <Accordion
        type="single"
        collapsible
        defaultValue={
          expanded[`item-${groupId}${memberId}`]
            ? `item-${groupId}${memberId}`
            : ""
        }
      >
        <AccordionItem value={`item-${groupId}${memberId}`}>
          <AccordionTrigger
            onClick={() => toggleExpand(`item-${groupId}${memberId}`)}
            className="pb-1 pr-4 pt-2"
          >
            <div className="flex items-center gap-x-4 px-4 text-sm">
              <Avatar
                userName={member?.name}
                userImageUrl={member?.user?.image}
              />
              <div className="flex items-center gap-x-1 font-medium">
                <span className="font-bold">{member?.name}</span>
                <span>{data.isInDebt ? "owes" : "gets back"}</span>
                <div
                  className={cn(
                    "flex items-center font-semibold",
                    isInDebt ? "text-orange-600" : "text-cta",
                  )}
                >
                  <DisplayAmount
                    variant="sm"
                    amount={displayAmount}
                    currency={currency}
                  />
                </div>
                <span>in total</span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="ml-[4.5rem] space-y-4">
              <ul className="space-y-2">
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
              </ul>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </li>
  );
}
