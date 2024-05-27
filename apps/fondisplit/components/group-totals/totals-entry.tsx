import { CurrencyCode } from "@fondingo/db-split";
import { Minus } from "@fondingo/ui/lucide";
import { cn } from "@fondingo/ui/utils";
import { DisplayAmount } from "~/components/display-amount";

interface IProps {
  title: string;
  amount: number;
  currency: CurrencyCode;
  className?: string;
  showNegative?: boolean;
}

export function TotalsEntry({
  title,
  amount,
  currency,
  className,
  showNegative,
}: IProps) {
  return (
    <div className="flex items-center justify-between">
      <h5>{title}</h5>
      <div className="flex items-center">
        {showNegative && amount < 0 && (
          <Minus className="h-4 w-4 text-orange-600" />
        )}
        <DisplayAmount
          amount={amount}
          currency={currency}
          className={cn("font-medium", className)}
        />
      </div>
    </div>
  );
}
