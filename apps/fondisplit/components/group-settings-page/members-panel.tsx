import { serverClient } from "~/lib/trpc/server-client";
import { PiUserCirclePlus } from "react-icons/pi";
import Link from "next/link";
import { MemberEntry } from "./member-entry";

interface IProps {
  group: Awaited<ReturnType<typeof serverClient.group.getGroupById>>;
}

export function MembersPanel({ group }: IProps) {
  return (
    <section className="space-y-6 px-4">
      <h3 className="text-base font-semibold">Group members</h3>
      <Link href="#" className="flex items-center gap-x-4">
        <div className="flex h-14 w-14 items-center justify-center">
          <PiUserCirclePlus className="h-8 w-8" />
        </div>
        <span className="font-semibold">Add people to group</span>
      </Link>
      <ul className="space-y-4">
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
