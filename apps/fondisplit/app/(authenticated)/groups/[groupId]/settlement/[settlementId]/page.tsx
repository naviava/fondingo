import { redirect } from "next/navigation";
import Link from "next/link";

import { SettlementActions } from "~/components/settlement-actions";
import { currencyIconMap } from "@fondingo/ui/constants";
import { ChevronLeft } from "@fondingo/ui/lucide";
import { FcMoneyTransfer } from "react-icons/fc";
import { Button } from "@fondingo/ui/button";

import { serverClient } from "~/lib/trpc/server-client";
import { format } from "@fondingo/utils/date-fns";

interface IProps {
  params: {
    groupId: string;
    settlementId: string;
  };
}

export default async function SettlementIdPage({ params }: IProps) {
  const user = await serverClient.user.getAuthProfile();
  const group = await serverClient.group.getGroupById(params.groupId);
  const settlement = await serverClient.expense.getSettlementById({
    groupId: params.groupId,
    settlementId: params.settlementId,
  });
  if (!settlement) return redirect(`/groups/${params.groupId}`);

  const CurrencyIcon = currencyIconMap[group.currency].icon;
  const creditorName =
    settlement.from.userId === user?.id ? "You" : settlement.from.name;
  const debtorName =
    settlement.to.userId === user?.id ? "you" : settlement.to.name;
  const creatorName =
    settlement.createdById === user?.id ? "you" : settlement.createdBy.name;

  return (
    <div className="h-full pb-24">
      <div className="relative flex items-center justify-between px-2 pt-4 text-neutral-700">
        <Button asChild size="sm" variant="ghost">
          <Link href={`/groups/${params.groupId}`}>
            <ChevronLeft />
          </Link>
        </Button>
        <SettlementActions
          groupId={params.groupId}
          settlementId={params.settlementId}
        />
      </div>
      <div className="mt-16 flex flex-col items-center justify-center gap-y-4">
        <FcMoneyTransfer size={80} />
        <h2 className="text-xl font-medium">{`${creditorName} paid ${debtorName}`}</h2>
        <h1 className="flex items-center text-4xl font-bold">
          <CurrencyIcon className="h-7 w-7" />
          {(settlement.amount / 100).toFixed(2)}
        </h1>
        <div className="space-y-1 text-center text-sm font-medium text-neutral-400">
          <p>
            Added by {creatorName} on{" "}
            {format(new Date(settlement.createdAt), "LLL d yyyy")}
          </p>
          <p>
            Last updated on{" "}
            {format(new Date(settlement.updatedAt), "LLL d yyyy")}
          </p>
        </div>
      </div>
      <div className="mt-16 px-8">
        <h3 className="font-semibold">Activity</h3>
        <p>Logs go here</p>
      </div>
    </div>
  );
}