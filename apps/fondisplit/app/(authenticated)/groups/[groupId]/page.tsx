import { GroupExpensesPanel } from "~/components/group-id-page/group-expenses-panel";
import { UtilityButtons } from "~/components/group-id-page/utility-buttons";
import { GroupActions } from "~/components/group-id-page/group-actions";
import { GroupAvatar } from "~/components/group-id-page/group-avatar";
import { GroupHeader } from "~/components/group-id-page/group-header";

import { serverClient } from "~/lib/trpc/server-client";
import { linearGradientWithAlpha } from "~/lib/utils";

interface IProps {
  params: {
    groupId: string;
  };
}

export default async function GroupIdPage({ params }: IProps) {
  const currentUser = await serverClient.user.getAuthProfile();
  const group = await serverClient.group.getGroupById(params.groupId);
  const currentUserRole = group.members.find(
    (member) => member.userId === currentUser?.id,
  )?.role;

  return (
    <article className="flex h-full flex-col">
      <div
        className="relative h-[7.5rem]"
        style={{
          backgroundImage: linearGradientWithAlpha(group.color, 0.5),
        }}
      >
        <UtilityButtons />
        <GroupAvatar groupType={group.type} groupColor={group.color} />
      </div>
      <section className="flex-1 pb-24 pt-12">
        <GroupHeader
          groupName={group.name}
          hasExpenses={!!group.expenses.length}
          debts={group.simplifiedDebts}
        />
        <GroupActions
          groupId={group.id}
          isGroupManager={currentUserRole === "MANAGER"}
        />
        <GroupExpensesPanel
          groupId={group.id}
          groupColor={group.color}
          isGroupManager={currentUserRole === "MANAGER"}
          hasMembers={group.members.length > 1}
          hasExpenses={!!group.expenses.length}
        />
      </section>
    </article>
  );
}