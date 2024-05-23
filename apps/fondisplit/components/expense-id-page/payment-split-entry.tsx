import { currencyIconMap } from "@fondingo/ui/constants";
import { CurrencyCode } from "@fondingo/db-split";
import { Avatar } from "@fondingo/ui/avatar";
import { cn } from "@fondingo/ui/utils";

interface IProps {
  type: "payment" | "split";
  creditorName?: string;
  didIPay?: boolean;
  debtorName?: string;
  doIOwe?: boolean;
  amount: number;
  currency: CurrencyCode;
  imageUrl?: string | null | undefined;
  avatarSize?: "default" | "sm" | "lg" | undefined;
}

export function PaymentSplitEntry({
  type,
  creditorName = "Unknown",
  didIPay,
  debtorName = "Unknown",
  doIOwe,
  amount,
  currency,
  imageUrl = "",
  avatarSize = "default",
}: IProps) {
  const CurrencyIcon = currencyIconMap[currency].icon;

  return (
    <li className="flex items-center gap-x-3 py-1 font-medium">
      <Avatar
        variant={avatarSize}
        userName={creditorName}
        userImageUrl={imageUrl}
      />
      <div className="flex items-center">
        {`${type === "payment" ? (didIPay ? "You paid" : creditorName + " paid") : doIOwe ? "You owe" : debtorName + " owes"}`}
        <CurrencyIcon
          className={cn("ml-1 h-4 w-4", avatarSize === "sm" && "h-3 w-3")}
        />
        <span>{(amount / 100).toFixed(2)}</span>
      </div>
    </li>
  );
}
