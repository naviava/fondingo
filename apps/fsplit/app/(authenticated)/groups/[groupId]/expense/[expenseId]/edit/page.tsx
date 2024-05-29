import ExpenseForm from "~/components/expense-form";
import { serverClient } from "~/lib/trpc/server-client";

interface IProps {
  params: {
    groupId: string;
    expenseId: string;
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
