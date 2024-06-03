import { redirect } from "next/navigation";
import Link from "next/link";

import { SettlementActions } from "~/components/settlement-actions";
import { DisplayAmount } from "~/components/display-amount";
import { ChevronLeft } from "@fondingo/ui/lucide";
import { FcMoneyTransfer } from "react-icons/fc";
import { Button } from "@fondingo/ui/button";

import { serverClient } from "~/lib/trpc/server-client";
import { format } from "@fondingo/utils/date-fns";
import { SettlementDetails } from "~/components/settlement-id-page/settlement-details";
import { LogEntry } from "~/components/log-entry";
import { DynamicScrollArea } from "@fondingo/ui/dynamic-scroll-area";

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

  const logs = await serverClient.logs.settlementByIdLogs(params.settlementId);

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
      <SettlementDetails
        debtorName={debtorName}
        currency={group.currency}
        creatorName={creatorName}
        amount={settlement.amount}
        creditorName={creditorName}
        updatedAt={settlement.updatedAt}
        createdAt={settlement.createdAt}
        lastUpdatedByName={lastUpdatedByName}
      />
      <div className="mt-12">
        <DynamicScrollArea crop={60}>
          <h4 className="px-6 text-xl font-semibold">Activity</h4>
          <div className="mt-4">
            {logs.map((log) => (
              <LogEntry
                key={log.id}
                message={log.message}
                createdAt={log.createdAt}
              />
            ))}
          </div>
        </DynamicScrollArea>
      </div>
    </div>
  );
}
