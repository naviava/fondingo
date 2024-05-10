import splitdb from "@fondingo/db-split";
import { redirect } from "next/navigation";
import { formatPrice } from "~/lib/utils";
import { SimplifyDebtsWidget } from "./_components/simplify-debts-widget";

interface IProps {
  params: {
    groupId: string;
  };
}

export default async function GroupIdPage({ params }: IProps) {
  const group = await splitdb.group.findUnique({
    where: {
      id: params.groupId,
    },
  });
  if (!group) {
    return redirect("/");
  }

  const expenses = await splitdb.expense.findMany({
    where: { groupId: group.id },
  });

  const creditors = await splitdb.expensePayment.findMany({
    where: {
      expenseId: {
        in: expenses.map((expense) => expense.id),
      },
    },
    include: { groupMember: true },
  });

  const debtors = await splitdb.expenseSplit.findMany({
    where: {
      expenseId: {
        in: expenses.map((expense) => expense.id),
      },
    },
    include: { groupMember: true },
  });

  const simplified = await splitdb.simplifiedDebt.findMany({
    where: { groupId: group.id },
    include: { from: true, to: true },
  });

  return (
    <main className="flex h-full flex-col items-center justify-center gap-y-8 text-center">
      <h1 className="text-2xl font-bold">Welcome to {group.name}</h1>
      {!!expenses && (
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Expenses</h2>
          {/* Expenses */}
          <ul className="space-y-1">
            {expenses.map((expense) => (
              <p key={expense.id}>{formatPrice(expense.amount)}</p>
            ))}
          </ul>
        </div>
      )}
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Creditors</h2>
        {/* Creditors */}
        <div className="space-y-1">
          {creditors.map((payment) => (
            <p
              key={payment.id}
            >{`${payment.groupMember.name} paid ${formatPrice(payment.amount)}`}</p>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Debtors</h2>
        {/* Expenses */}
        <div className="space-y-1">
          {debtors.map((debt) => (
            <p
              key={debt.id}
            >{`${debt.groupMember.name} owes ${formatPrice(debt.amount)}`}</p>
          ))}
        </div>
      </div>
      <SimplifyDebtsWidget />
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Simplified Debts</h2>
        {/* Simplified Debts */}
        <div className="space-y-1">
          {simplified.map((debt) => (
            <p
              key={debt.id}
            >{`${debt.from.name} has to pay ${debt.to.name} ${formatPrice(debt.amount)}`}</p>
          ))}
        </div>
      </div>
    </main>
  );
}
