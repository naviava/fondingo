"use client";

import { usePanelHeight } from "@fondingo/store/use-panel-height";
import { serverClient } from "~/lib/trpc/server-client";
import { useEffect, useRef } from "react";

import { PaymentSplitEntry } from "./payment-split-entry";
import { Separator } from "@fondingo/ui/separator";
import { DynamicScrollArea } from "@fondingo/ui/dynamic-scroll-area";
import { LogEntry } from "../log-entry";

interface IProps {
  user: Awaited<ReturnType<typeof serverClient.user.getAuthProfile>>;
  group: Awaited<ReturnType<typeof serverClient.group.getGroupById>>;
  logs: Awaited<ReturnType<typeof serverClient.logs.expenseByIdLogs>>;
  expense: Awaited<ReturnType<typeof serverClient.expense.getExpenseById>>;
}

export function ExpenseDetails({ user, group, expense, logs }: IProps) {
  const topDivRef = useRef<HTMLDivElement>(null);
  const { setTopRef } = usePanelHeight((state) => state);

  useEffect(() => {
    function updateTopDivPosition() {
      const topDiv = topDivRef.current?.getBoundingClientRect();
      setTopRef(topDiv?.bottom);
    }
    updateTopDivPosition();
    window.addEventListener("resize", updateTopDivPosition);
    return () => window.removeEventListener("resize", updateTopDivPosition);
  }, [setTopRef, topDivRef]);

  return (
    <>
      <Separator ref={topDivRef} className="my-4" />
      <DynamicScrollArea>
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
        <h4 className="px-6 text-xl font-semibold">Activity</h4>
        <div className="mt-4">
          {logs.map((log) => (
            <LogEntry
              key={log.id}
              message={log.message}
              createdAt={log.createdAt}
            />
          ))}
        </div>
      </DynamicScrollArea>
    </>
  );
}
