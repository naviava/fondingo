import { GroupExpensesPanel } from "~/components/group-id-page/group-expenses-panel";
import { UtilityButtons } from "~/components/group-id-page/utility-buttons";
import { GroupActions } from "~/components/group-id-page/group-actions";
import { GroupHeader } from "~/components/group-id-page/group-header";
import { GroupBalanceEntry } from "~/components/group-balance-entry";
import { GroupLog } from "~/components/group-id-page/group-log";
import { GroupAvatar } from "~/components/group-avatar";

import { serverClient } from "~/lib/trpc/server-client";
import { linearGradientWithAlpha } from "~/lib/utils";

interface IProps {
  params: {
    groupId: string;
  };
  searchParams: {
    showBalances: boolean;
    showTotals: boolean;
  };
}

export default async function GroupIdPage({ params, searchParams }: IProps) {
  // TODO: Handle this better
  const currentUser = await serverClient.user.getAuthProfile();
  const group = await serverClient.group.getGroupById(params.groupId);
  const currentUserRole = group.members.find(
    (member) => member.userId === currentUser?.id,
  )?.role;

  const groupMemberIds = group.members.map((member) => member.id);

  return (
    <article className="flex flex-col">
      <div
        className="relative h-[7.5rem]"
        style={{
          backgroundImage: linearGradientWithAlpha(group.color, 0.5),
        }}
      >
        <UtilityButtons
          groupId={params.groupId}
          showTotals={searchParams.showTotals}
          showBalances={searchParams.showBalances}
        />
        <GroupAvatar
          groupType={group.type}
          groupColor={group.color}
          className="absolute -bottom-8 left-20"
        />
      </div>
      <section className="pb-24 pt-12">
        <GroupHeader
          userId={currentUser?.id}
          groupName={group.name}
          currency={group.currency}
          hasExpenses={!!group.expenses.length}
          groupDebts={group.simplifiedDebts}
        />
        <GroupActions
          groupId={group.id}
          userId={currentUser?.id}
          groupColor={group.color}
          hasDebts={!!group.simplifiedDebts.length}
          hasExpenses={!!group.expenses.length}
          isGroupManager={currentUserRole === "MANAGER"}
        />
        <GroupExpensesPanel
          userId={currentUser?.id}
          groupId={group.id}
          groupColor={group.color}
          isGroupManager={currentUserRole === "MANAGER"}
          hasMembers={group.members.length > 1}
          hasExpenses={!!group.expenses.length}
        >
          {searchParams.showBalances && (
            <ul>
              {groupMemberIds.map((id) => (
                <GroupBalanceEntry
                  key={id}
                  groupId={group.id}
                  memberId={id}
                  currency={group.currency}
                />
              ))}
            </ul>
          )}
          {searchParams.showTotals && <div>Totals section</div>}
          {!searchParams.showBalances && !searchParams.showTotals && (
            <GroupLog
              userId={currentUser?.id}
              groupId={group.id}
              groupColor={group.color}
              currency={group.currency}
            />
          )}
        </GroupExpensesPanel>
      </section>
    </article>
  );
}
