import { serverClient } from "~/lib/trpc/server-client";
import { TotalsEntry } from "./totals-entry";
import { cn } from "@fondingo/ui/utils";

interface IProps {
  groupId: string;
}

export async function GroupTotals({ groupId }: IProps) {
  const {
    currency,
    paymentsMade,
    yourTotalShare,
    totalYouPaidFor,
    paymentsReceived,
    totalGroupSpending,
    totalChangeInBalance,
  } = await serverClient.group.getGroupTotals(groupId);

  return (
    <section className="px-4">
      <h3 className="mb-6 text-lg font-semibold">Group spending summary</h3>
      <div className="space-y-4">
        <TotalsEntry
          currency={currency}
          title="Total group spending"
          amount={totalGroupSpending}
          className={cn(
            "text-cta",
            totalGroupSpending === 0 && "text-neutral-400",
          )}
        />
        <TotalsEntry
          currency={currency}
          amount={totalYouPaidFor}
          title="Total you paid for"
          className={cn(
            "text-cta",
            totalYouPaidFor === 0 && "text-neutral-400",
          )}
        />
        <TotalsEntry
          currency={currency}
          amount={yourTotalShare}
          title="Your total share"
          className={cn(
            "text-orange-600",
            yourTotalShare === 0 && "text-neutral-400",
          )}
        />
        <TotalsEntry
          currency={currency}
          amount={paymentsMade}
          title="Payments made"
          className={cn("text-cta", paymentsMade === 0 && "text-neutral-400")}
        />
        <TotalsEntry
          currency={currency}
          amount={paymentsReceived}
          title="Payments received"
          className={cn(
            "text-orange-600",
            paymentsReceived === 0 && "text-neutral-400",
          )}
        />
        <TotalsEntry
          showNegative
          currency={currency}
          amount={totalChangeInBalance}
          title="Total change in balance"
          className={cn(
            totalChangeInBalance > 0 ? "text-cta" : "text-orange-600",
            totalChangeInBalance === 0 && "text-neutral-400",
          )}
        />
      </div>
    </section>
  );
}
