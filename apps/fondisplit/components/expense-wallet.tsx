import { Wallet } from "@fondingo/ui/lucide";
import { hexToRgb } from "~/lib/utils";

interface IProps {
  groupColor: string;
}

export function ExpenseWallet({ groupColor }: IProps) {
  return (
    <div
      className="p-3"
      style={{
        border: `2px solid ${hexToRgb(groupColor, 0.3)}`,
      }}
    >
      <Wallet className="h-6 w-6 text-rose-800 md:h-8 md:w-8" />
    </div>
  );
}
