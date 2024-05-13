import { DebtWithDetails } from "~/types";

interface IProps {
  groupName: string;
  hasExpenses: boolean;
  debts: DebtWithDetails[];
}

export function GroupHeader({ groupName, hasExpenses, debts }: IProps) {
  return (
    <div className="ml-[5.3rem]">
      <h1 className="text-2xl font-semibold">{groupName}</h1>
      {!hasExpenses && <p className="text-base">No expenses here yet.</p>}
      {hasExpenses && !debts.length && (
        <p className="text-base">All debts settled.</p>
      )}
      {/* TODO: Show group debts. */}
    </div>
  );
}
