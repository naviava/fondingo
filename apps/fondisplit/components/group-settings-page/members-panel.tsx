import { serverClient } from "~/lib/trpc/server-client";
import { MemberEntry } from "./member-entry";
import { useAddMemberModal } from "@fondingo/store/fondisplit";
import { AddMemberOption } from "./add-member-option";

interface IProps {
  group: Awaited<ReturnType<typeof serverClient.group.getGroupById>>;
}

export function MembersPanel({ group }: IProps) {
  return (
    <section className="space-y-6">
      <h3 className="px-4 text-base font-semibold">Group members</h3>
      <AddMemberOption groupId={group.id} />
      <ul className="space-y-4 px-4">
        {group.members.map((member) => (
          <MemberEntry
            key={member.email}
            groupId={group.id}
            currency={group.currency}
            memberId={member.id}
            memberName={member.name}
            memberEmail={member.email}
            imageUrl={member.user?.image}
          />
        ))}
      </ul>
    </section>
  );
}
