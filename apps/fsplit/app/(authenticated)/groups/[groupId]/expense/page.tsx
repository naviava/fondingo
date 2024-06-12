import { Metadata } from "next";
import ExpenseForm from "~/components/forms/expense-form";
import { serverClient } from "~/lib/trpc/server-client";

interface IProps {
  params: {
    groupId: string;
  };
}

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
  const group = await serverClient.group.getGroupById(params.groupId);
  if (!group) return {};

  return {
    title: `Add Expense | ${group.name}`,
    description: `Add a new expense to group: ${group.name}`,
  };
}

export default function AddExpensePage({ params }: IProps) {
  return <ExpenseForm groupId={params.groupId} />;
}
