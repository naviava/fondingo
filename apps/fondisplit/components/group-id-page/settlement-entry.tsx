import { currencyIconMap } from "@fondingo/ui/constants";
import { CurrencyCode } from "@fondingo/db-split";
import { FcMoneyTransfer } from "react-icons/fc";
import { EntryDate } from "./entry-date";

interface IProps {
  createdAt: Date;
  fromName: string;
  toName: string;
  amount: number;
  currency: CurrencyCode;
}

export function SettlementEntry({
  currency,
  amount,
  createdAt,
  fromName = "Unknown",
  toName = "Unknown",
}: IProps) {
  const CurrencyIcon = currencyIconMap[currency].icon;

  return (
    <div
      role="button"
      className="text-muted-foreground mb-6 flex items-center gap-x-4 px-4 py-1 font-semibold hover:bg-neutral-200"
    >
      <EntryDate createdAt={createdAt} />
      <div className="px-3 md:px-4">
        <FcMoneyTransfer className="h-6 w-6 md:h-8 md:w-8" />
      </div>
      <div className="flex items-center text-sm">
        <p>
          {fromName} paid {toName}
        </p>
        <div className="flex items-center">
          <CurrencyIcon className="ml-1 h-3 w-3" />
          <p>{(amount / 100).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
