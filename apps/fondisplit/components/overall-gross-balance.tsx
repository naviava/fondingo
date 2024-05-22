import { RefreshButton } from "@fondingo/ui/refresh-button";
import { serverClient } from "~/lib/trpc/server-client";
import { IndianRupee } from "@fondingo/ui/lucide";
import { cn } from "@fondingo/ui/utils";

const panelTextMap = {
  positive: "you are owed",
  negative: "you owe",
  zero: "you are settled up",
};

// TODO: Handle different currencies
export async function OverallGrossBalance() {
  const grossBalance = await serverClient.user.getGrossBalance();
  const isInDebt = grossBalance < 0;

  const displayAmount = isInDebt
    ? ((grossBalance / 100) * -1).toFixed(2)
    : (grossBalance / 100).toFixed(2);

  return (
    <div className="flex items-center justify-between px-4">
      <h1 className="my-10 flex items-center font-semibold">
        Overall,{" "}
        {grossBalance === 0
          ? panelTextMap["zero"]
          : isInDebt
            ? panelTextMap["negative"]
            : panelTextMap["positive"]}
        {grossBalance !== 0 && (
          <div
            className={cn(
              "flex items-center",
              isInDebt ? "text-orange-600" : "text-cta",
            )}
          >
            <IndianRupee className="h-4 w-4" />
            <span>{displayAmount}</span>
          </div>
        )}
      </h1>
      <RefreshButton />
    </div>
  );
}
