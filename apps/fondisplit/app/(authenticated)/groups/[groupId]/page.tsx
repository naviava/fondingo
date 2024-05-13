import { UtilityButtons } from "~/components/group-id-page/utility-buttons";
import { GroupActions } from "~/components/group-id-page/group-actions";
import { GroupAvatar } from "~/components/group-id-page/group-avatar";
import { GroupHeader } from "~/components/group-id-page/group-header";

import { serverClient } from "~/lib/trpc/server-client";
import { hexToRgb } from "~/lib/utils";
import { GroupExpensesPanel } from "~/components/group-id-page/group-expenses-panel";

interface IProps {
  params: {
    groupId: string;
  };
}

export default async function GroupIdPage({ params }: IProps) {
  const group = await serverClient.group.getGroupById(params.groupId);

  return (
    <article className="flex h-full flex-col">
      <div
        className="relative h-[7.5rem]"
        style={{
          backgroundImage: `linear-gradient(to bottom left, ${group.color}, ${hexToRgb(group.color, "0.5")})`,
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
        <GroupActions />
        <GroupExpensesPanel
          hasMembers={group.members.length > 1}
          hasExpenses={!!group.expenses.length}
        />
      </section>
    </article>
  );
}
