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
import { ExpenseDetails } from "~/components/expense-id-page/expense-details";

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

  const groupMemberUserIds = group.members.map((member) => member.user?.id);
  const isExpenseCreatorInGroup = groupMemberUserIds.includes(
    expense.createdById,
  );

  const expenseCreator = isExpenseCreatorInGroup
    ? expense.createdById === user?.id
      ? "you"
      : expense.createdBy.name
    : "(deleted)";
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
      <ExpenseDetails user={user} group={group} expense={expense} />
    </div>
  );
}
