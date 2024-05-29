import { serverClient } from "~/lib/trpc/server-client";
import { MemberEntry } from "./member-entry";
import { AddMemberOption } from "./add-member-option";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/lib/utils";

interface IProps {
  userId?: string;
  group: Awaited<ReturnType<typeof serverClient.group.getGroupById>>;
}

export function MembersPanel({ userId = "", group }: IProps) {
  return (
    <section className="space-y-6">
      <h3 className={cn("px-4 text-base font-semibold", hfont.className)}>
        Group members
      </h3>
      <AddMemberOption userId={userId} groupId={group.id} />
      <ul className="space-y-4 px-4">
        {group.members.map((member) => (
          <MemberEntry
            key={member.email}
            groupId={group.id}
            memberId={member.id}
            memberName={member.name}
            memberRole={member.role}
            memberEmail={member.email}
            currency={group.currency}
            imageUrl={member.user?.image}
          />
        ))}
      </ul>
    </section>
  );
}
