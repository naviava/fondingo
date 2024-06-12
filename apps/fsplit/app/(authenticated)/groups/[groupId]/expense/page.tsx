import ExpenseForm from "~/components/forms/expense-form";

interface IProps {
  params: {
    groupId: string;
  };
}

export default function AddExpensePage({ params }: IProps) {
  return <ExpenseForm groupId={params.groupId} />;
}
