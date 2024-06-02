import { RefreshButton } from "@fondingo/ui/refresh-button";
import { serverClient } from "~/lib/trpc/server-client";
import { cn } from "@fondingo/ui/utils";
import { DisplayAmount } from "./display-amount";

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
    ? Number((Math.floor(grossBalance * 100) / 100) * -1)
    : Number(Math.floor(grossBalance * 100) / 100);

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
          <DisplayAmount
            currency="INR"
            amount={displayAmount}
            className={cn("ml-1", isInDebt ? "text-orange-600" : "text-cta")}
          />
        )}
      </h1>
      <RefreshButton />
    </div>
  );
}
