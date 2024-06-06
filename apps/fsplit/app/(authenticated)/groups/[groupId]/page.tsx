import { Suspense } from "react";

import { GroupBalanceEntry } from "~/components/group-id-page/group-balance-entry";
import { LoadingState } from "~/components/group-id-page/loading-state";
import { GroupTotals } from "~/components/group-id-page/group-totals";
import { GroupPanel } from "~/components/group-id-page/group-panel";
import { GroupLog } from "~/components/group-id-page/group-log";

import { serverClient } from "~/lib/trpc/server-client";
import { LogEntry } from "~/components/log-entry";

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

export default async function GroupIdPage({ params, searchParams }: IProps) {
  const currentUser = await serverClient.user.getAuthProfile();
  const group = await serverClient.group.getGroupById(params.groupId);
  const logs = await serverClient.logs.groupByIdLogs(params.groupId);
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
          <Suspense fallback={<LoadingState />}>
            <ul>
              {logs.map((log) => (
                <LogEntry
                  key={log.id}
                  message={log.message}
                  createdAt={log.createdAt}
                />
              ))}
            </ul>
          </Suspense>
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
