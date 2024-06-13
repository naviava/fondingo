import { Suspense } from "react";

import { GroupBalanceEntry } from "~/components/group-id-page/group-balance-entry";
import { LoadingState } from "~/components/group-id-page/loading-state";
import { GroupTotals } from "~/components/group-id-page/group-totals";
import { GroupPanel } from "~/components/group-id-page/group-panel";
import { GroupLog } from "~/components/group-id-page/group-log";

import { serverClient } from "~/lib/trpc/server-client";
import { LogEntry } from "~/components/log-entry";
import { Metadata } from "next";

interface IProps {
  params: {
    groupId: string;
  };
  searchParams?: {
    showTotals?: boolean;
    showBalances?: boolean;
    showActivity?: boolean;
  };
}

export async function generateMetadata({
  params,
  searchParams,
}: IProps): Promise<Metadata> {
  const group = await serverClient.group.getGroupById(params.groupId);
  if (!group) return {};

  if (
    searchParams?.showBalances &&
    !searchParams.showTotals &&
    !searchParams.showActivity
  ) {
    return {
      title: `Balances for ${group.name}`,
      description: `View balances for group: ${group.name}`,
    };
  }
  if (
    searchParams?.showTotals &&
    !searchParams.showBalances &&
    !searchParams.showActivity
  ) {
    return {
      title: `Totals for ${group.name}`,
      description: `View totals for group: ${group.name}`,
    };
  }
  if (
    searchParams?.showActivity &&
    !searchParams.showBalances &&
    !searchParams.showTotals
  ) {
    return {
      title: `Activity log for ${group.name}`,
      description: `View activity log for group: ${group.name}`,
    };
  }

  return {
    title: `${group.name}`,
    description: `View and manage your group: ${group.name}`,
  };
}

export default async function GroupIdPage({ params, searchParams }: IProps) {
  const [currentUser, group, logs] = await Promise.all([
    serverClient.user.getAuthProfile(),
    serverClient.group.getGroupById(params.groupId),
    serverClient.logs.groupByIdLogs(params.groupId),
  ]);
  const groupMemberIds = group.members.map((member) => member.id);

  return (
    <GroupPanel params={params} searchParams={searchParams}>
      {searchParams?.showBalances &&
        !searchParams.showTotals &&
        !searchParams.showActivity && (
          <ul>
            {groupMemberIds.map((id, idx) => (
              <GroupBalanceEntry
                key={id}
                index={idx}
                groupId={group.id}
                memberId={id}
                currency={group.currency}
              />
            ))}
          </ul>
        )}
      {searchParams?.showTotals &&
        !searchParams.showBalances &&
        !searchParams.showActivity && (
          <Suspense fallback={<LoadingState />}>
            <GroupTotals groupId={group.id} />
          </Suspense>
        )}
      {searchParams?.showActivity &&
        !searchParams.showBalances &&
        !searchParams.showTotals && (
          <ul>
            {logs.map((log) => (
              <LogEntry
                key={log.id}
                message={log.message}
                createdAt={log.createdAt}
              />
            ))}
          </ul>
        )}
      {!searchParams?.showBalances &&
        !searchParams?.showTotals &&
        !searchParams?.showActivity && (
          <GroupLog
            userId={currentUser?.id}
            groupId={group.id}
            groupColor={group.color}
            currency={group.currency}
          />
        )}
    </GroupPanel>
  );
}
