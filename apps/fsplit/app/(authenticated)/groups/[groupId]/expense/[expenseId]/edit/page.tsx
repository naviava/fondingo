import { Metadata } from "next";

import ExpenseForm from "~/components/forms/expense-form";
import { serverClient } from "~/lib/trpc/server-client";

interface IProps {
  params: {
    groupId: string;
    expenseId: string;
  };
}

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
  const expense = await serverClient.expense.getExpenseById({
    groupId: params.groupId,
    expenseId: params.expenseId,
  });
  if (!expense) return {};

  return {
    title: `Edit | ${expense.name}`,
    description: `Edit details of expense: ${expense.name}`,
  };
}

export default async function ExpenseIdEditPage({ params }: IProps) {
  const expense = await serverClient.expense.getExpenseById({
    groupId: params.groupId,
    expenseId: params.expenseId,
  });

  return (
    <ExpenseForm
      isEditing
      expense={expense}
      groupId={params.groupId}
      expenseId={params.expenseId}
    />
  );
}
