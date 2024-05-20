import { IndianRupee } from "@fondingo/ui/lucide";
import Link from "next/link";
import { serverClient } from "~/lib/trpc/server-client";
import { EmptyState } from "./empty-state";
import { GroupAvatar } from "../group-id-page/group-avatar";
import { useMediaQuery } from "@fondingo/utils/hooks";

interface IProps {
  groups: Awaited<ReturnType<typeof serverClient.group.getGroups>>;
}

export async function GroupsPanel({ groups = [] }: IProps) {
  if (!groups.length) {
    return <EmptyState />;
  }

  return (
    <section className="flex flex-1 flex-col gap-y-8 px-4 pb-24">
      {groups.map((group) => (
        <Link key={group.id} href={`/groups/${group.id}`}>
          <div className="flex items-center">
            <GroupAvatar
              variant="sm"
              groupType={group.type}
              groupColor={group.color}
            />
            <h2 className="mx-2 line-clamp-1 flex-1 font-medium">
              {group.name}
            </h2>
            <div className="flex flex-col items-end justify-center">
              <span className="text-xs font-medium md:text-sm">
                you are owed
              </span>
              <div className="flex items-center">
                <IndianRupee className="mr-1 h-4 w-4" />
                <span className="font-semibold">20.00</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </section>
  );
}
