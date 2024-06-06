import { GroupExpensesPanel } from "~/components/group-id-page/group-expenses-panel";
import { UtilityButtons } from "~/components/group-id-page/utility-buttons";
import { GroupActions } from "~/components/group-id-page/group-actions";
import { GroupHeader } from "~/components/group-id-page/group-header";
import { GroupAvatar } from "~/components/group-avatar";

import { serverClient } from "~/lib/trpc/server-client";
import { linearGradientWithAlpha } from "~/utils";

interface IProps {
  children: React.ReactNode;
  params: {
    groupId: string;
  };
  searchParams?: {
    showBalances?: boolean;
    showTotals?: boolean;
    showActivity?: boolean;
  };
}

export async function GroupPanel({ children, params, searchParams }: IProps) {
  const currentUser = await serverClient.user.getAuthProfile();
  const group = await serverClient.group.getGroupById(params.groupId);
  const currentUserRole = group.members.find(
    (member) => member.userId === currentUser?.id,
  )?.role;

  return (
    <article className="flex flex-col">
      <div
        className="relative h-[4.5rem]"
        style={{
          backgroundImage: linearGradientWithAlpha(group.color, 0.5),
        }}
      >
        <UtilityButtons
          groupId={params.groupId}
          showTotals={searchParams?.showTotals}
          showBalances={searchParams?.showBalances}
          showActivity={searchParams?.showActivity}
        />
        <GroupAvatar
          groupType={group.type}
          groupColor={group.color}
          className="absolute -bottom-8 left-20"
        />
      </div>
      <section className="pt-10">
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
          hasExpenses={!!group.expenses.length}
          hasMembers={group.members.length > 1}
          hasPayments={!!group.settlements.length}
          isGroupManager={currentUserRole === "MANAGER"}
        >
          {children}
        </GroupExpensesPanel>
      </section>
    </article>
  );
}
