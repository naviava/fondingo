"use client";

import { usePanelHeight } from "@fondingo/store/use-panel-height";
import { serverClient } from "~/lib/trpc/server-client";
import { useEffect, useRef } from "react";

import { PaymentSplitEntry } from "./payment-split-entry";
import { ScrollArea } from "@fondingo/ui/scroll-area";
import { Separator } from "@fondingo/ui/separator";

interface IProps {
  user: Awaited<ReturnType<typeof serverClient.user.getAuthProfile>>;
  group: Awaited<ReturnType<typeof serverClient.group.getGroupById>>;
  expense: Awaited<ReturnType<typeof serverClient.expense.getExpenseById>>;
}

export function ExpenseDetails({ user, group, expense }: IProps) {
  const topDivRef = useRef<HTMLDivElement>(null);
  const { panelHeight, topRef, bottomRef, setTopRef } = usePanelHeight(
    (state) => state,
  );

  useEffect(() => {
    function updateTopDivPosition() {
      const topDiv = topDivRef.current?.getBoundingClientRect();
      setTopRef(topDiv?.bottom);
    }
    updateTopDivPosition();
    window.addEventListener("resize", updateTopDivPosition);
    return () => window.removeEventListener("resize", updateTopDivPosition);
  }, [setTopRef]);

  return (
    <>
      <Separator ref={topDivRef} className="my-4" />
      <ScrollArea
        style={{
          height: topRef && bottomRef ? `${panelHeight - 32}px` : "default",
        }}
      >
        <div className="px-6">
          <ul>
            {expense.payments.map((payment) => (
              <PaymentSplitEntry
                key={payment.id}
                type="payment"
                creditorName={payment.groupMember.name}
                didIPay={payment.groupMember.user?.id === user?.id}
                amount={payment.amount}
                currency={group.currency}
                imageUrl={payment.groupMember.user?.image}
              />
            ))}
          </ul>
          <ul className="text-muted-foreground ml-10 mt-2 text-sm">
            {expense.splits.map((split) => (
              <PaymentSplitEntry
                key={split.id}
                type="split"
                debtorName={split.groupMember.name}
                doIOwe={split.groupMember.user?.id === user?.id}
                amount={split.amount}
                currency={group.currency}
                imageUrl={split.groupMember.user?.image}
                avatarSize="sm"
              />
            ))}
          </ul>
        </div>
        <Separator className="my-4" />
        {/* TODO: Add expense activity */}
        <div className="px-6">
          <h4 className="text-xl font-semibold">Activity</h4>
          <div className="mt-4 font-medium">Ticket log goes here.</div>
        </div>
      </ScrollArea>
    </>
  );
}
