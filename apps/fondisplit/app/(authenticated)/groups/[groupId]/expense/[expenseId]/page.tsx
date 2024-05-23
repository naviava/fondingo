import Link from "next/link";

import { PaymentSplitEntry } from "~/components/expense-id-page/payment-split-entry";
import { ExpenseActions } from "~/components/expense-id-page/expense-actions";
import { ExpenseHeader } from "~/components/expense-id-page/expense-header";
import { Separator } from "@fondingo/ui/separator";
import { ChevronLeft } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";

import { serverClient } from "~/lib/trpc/server-client";
import { format } from "@fondingo/utils/date-fns";
import { ScrollArea } from "@fondingo/ui/scroll-area";

interface IProps {
  params: {
    groupId: string;
    expenseId: string;
  };
}

export default async function ExpenseIdPage({ params }: IProps) {
  const user = await serverClient.user.getAuthProfile();
  const group = await serverClient.group.getGroupById(params.groupId);
  const expense = await serverClient.expense.getExpenseById({
    groupId: params.groupId,
    expenseId: params.expenseId,
  });

  const expenseCreator =
    expense.createdById === user?.id ? "you" : expense.createdBy.name;
  const createdAt = format(new Date(expense.createdAt), "d MMMM yyyy");
  const updatedAt = format(new Date(expense.updatedAt), "d MMMM yyyy");

  return (
    <div className="pb-24">
      <div className="relative flex items-center justify-between px-2 pt-4 text-neutral-700">
        <Button asChild size="sm" variant="ghost">
          <Link href={`/groups/${params.groupId}`}>
            <ChevronLeft />
          </Link>
        </Button>
        <h2 className="absolute left-1/2 -translate-x-1/2 text-lg font-semibold">
          Details
        </h2>
        <ExpenseActions groupId={group.id} expenseId={expense.id} />
      </div>
      <ExpenseHeader
        groupColor={group.color}
        currency={group.currency}
        expenseName={expense.name}
        expenseCreator={expenseCreator || "Unknown"}
        expenseAmount={expense.amount}
        createdAt={createdAt}
        updatedAt={updatedAt}
      />
      <Separator className="my-4" />
      <ScrollArea className="h-[67vh]">
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
    </div>
  );
}
