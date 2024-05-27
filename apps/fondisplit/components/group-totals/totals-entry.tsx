import { CurrencyCode } from "@fondingo/db-split";
import { cn } from "@fondingo/ui/utils";
import { DisplayAmount } from "~/components/display-amount";

interface IProps {
  title: string;
  amount: number;
  currency: CurrencyCode;
}

export function TotalsEntry({ title, amount, currency }: IProps) {
  const isInDebt = amount < 0;

  return (
    <div className="flex items-center justify-between">
      <h5>{title}</h5>
      <DisplayAmount
        amount={amount}
        currency={currency}
        className={cn(
          "font-medium",
          amount === 0
            ? "text-muted-foreground"
            : isInDebt
              ? "text-orange-600"
              : "text-cta",
        )}
      />
    </div>
  );
}
