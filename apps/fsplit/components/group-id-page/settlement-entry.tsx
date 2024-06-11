import { DisplayAmount } from "~/components/display-amount";
import { TCurrencyCode } from "@fondingo/db-split";
import { FcMoneyTransfer } from "react-icons/fc";
import { EntryDate } from "./entry-date";

interface IProps {
  createdAt: Date;
  fromName: string;
  toName: string;
  amount: number;
  currency: TCurrencyCode;
}

export function SettlementEntry({
  currency,
  amount,
  createdAt,
  fromName = "Unknown",
  toName = "Unknown",
}: IProps) {
  return (
    <div
      role="button"
      className="text-muted-foreground mb-2 flex items-center gap-x-4 px-4 py-2 font-semibold hover:bg-neutral-200"
    >
      <EntryDate createdAt={createdAt} />
      <div className="px-2">
        <FcMoneyTransfer className="h-6 w-6 md:h-8 md:w-8" />
      </div>
      <div className="flex items-center text-sm">
        <p>
          {fromName} paid {toName}
        </p>
        <DisplayAmount
          variant="sm"
          amount={amount}
          currency={currency}
          className="ml-1"
        />
      </div>
    </div>
  );
}
