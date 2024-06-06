"use client";

import { serverClient } from "~/lib/trpc/server-client";
import { usePanel } from "@fondingo/ui/use-panel";

import { DynamicScrollArea } from "@fondingo/ui/dynamic-scroll-area";
import { PaymentSplitEntry } from "./payment-split-entry";
import { Separator } from "@fondingo/ui/separator";
import { LogEntry } from "~/components/log-entry";

interface IProps {
  user: Awaited<ReturnType<typeof serverClient.user.getAuthProfile>>;
  group: Awaited<ReturnType<typeof serverClient.group.getGroupById>>;
  logs: Awaited<ReturnType<typeof serverClient.logs.expenseByIdLogs>>;
  expense: Awaited<ReturnType<typeof serverClient.expense.getExpenseById>>;
}

export function ExpenseDetails({ user, group, expense, logs }: IProps) {
  const { topDivRef } = usePanel();

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
        <ul className="mt-4">
          {logs.map((log) => (
            <LogEntry
              key={log.id}
              message={log.message}
              createdAt={log.createdAt}
            />
          ))}
        </ul>
      </DynamicScrollArea>
    </>
  );
}
