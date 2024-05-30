import { redirect } from "next/navigation";
import Link from "next/link";

import { SettlementActions } from "~/components/settlement-actions";
import { DisplayAmount } from "~/components/display-amount";
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

  const groupMemberIds = group.members.map((member) => member.id);
  const isCreditorInGroup = groupMemberIds.includes(settlement.from.id);
  const isDebtorInGroup = groupMemberIds.includes(settlement.to.id);

  const groupMemberUserIds = group.members.map((member) => member.user?.id);
  const isSettlementCreatorInGroup = groupMemberUserIds.includes(
    settlement.createdById,
  );
  const isSettlementLastModifiedByInGroup = groupMemberUserIds.includes(
    settlement.lastModifiedById,
  );

  const creditorName = isCreditorInGroup
    ? settlement.from.userId === user?.id
      ? "You"
      : settlement.from.name
    : "(deleted)";
  const debtorName = isDebtorInGroup
    ? settlement.to.userId === user?.id
      ? "you"
      : settlement.to.name
    : "(deleted)";
  const creatorName = isSettlementCreatorInGroup
    ? settlement.createdById === user?.id
      ? "you"
      : settlement.createdBy.name
    : "(deleted)";
  const lastUpdatedByName = isSettlementLastModifiedByInGroup
    ? settlement.lastModifiedById === user?.id
      ? "you"
      : settlement.lastModifiedBy.name
    : "(deleted)";

  return (
    <div className="h-full pb-24">
      <div className="relative flex items-center justify-between px-2 pt-4 text-neutral-700">
        <Button asChild size="sm" variant="ghost">
          <Link href={`/groups/${params.groupId}`}>
            <ChevronLeft />
          </Link>
        </Button>
        <SettlementActions groupId={params.groupId} settlement={settlement} />
      </div>
      <div className="mt-16 flex flex-col items-center justify-center gap-y-4">
        <FcMoneyTransfer size={80} />
        <h2 className="text-xl font-medium">{`${creditorName} paid ${debtorName}`}</h2>
        <h1 className="flex items-center font-bold">
          <DisplayAmount
            variant="xl"
            amount={settlement.amount}
            currency={group.currency}
          />
        </h1>
        <div className="space-y-1 text-center text-sm font-medium text-neutral-400">
          <p>
            Added by {creatorName} on{" "}
            {format(new Date(settlement.createdAt), "LLL d yyyy")}
          </p>
          <p>
            Last updated by {lastUpdatedByName} on{" "}
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