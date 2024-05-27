import { serverClient } from "~/lib/trpc/server-client";
import { TotalsEntry } from "./totals-entry";

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
        />
        <TotalsEntry
          currency={currency}
          amount={totalYouPaidFor}
          title="Total you paid for"
        />
        <TotalsEntry
          currency={currency}
          amount={yourTotalShare}
          title="Your total share"
        />
        <TotalsEntry
          currency={currency}
          amount={paymentsMade}
          title="Payments made"
        />
        <TotalsEntry
          currency={currency}
          amount={paymentsReceived}
          title="Payments received"
        />
        <TotalsEntry
          currency={currency}
          amount={totalChangeInBalance}
          title="Total change in balance"
        />
      </div>
    </section>
  );
}
