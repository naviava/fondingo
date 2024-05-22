import { redirect } from "next/navigation";
import Link from "next/link";

import { OverallGrossBalance } from "./overall-gross-balance";
import { GroupAvatar } from "~/components/group-avatar";
import { DebtsOverview } from "./debts-overview";
import { GroupBalance } from "./group-balance";
import { EmptyState } from "./empty-state";

import { serverClient } from "~/lib/trpc/server-client";

interface IProps {
  user: Awaited<ReturnType<typeof serverClient.user.getAuthProfile>>;
  groups: Awaited<ReturnType<typeof serverClient.group.getGroups>>;
}

export async function GroupsPanel({ user, groups = [] }: IProps) {
  if (!user) return redirect("/api/auth/signin");
  if (!groups.length) return <EmptyState />;

  return (
    <>
      <OverallGrossBalance />
      <section className="flex flex-1 flex-col gap-y-8 px-4 pb-24">
        {groups.map((group) => (
          <Link key={group.id} href={`/groups/${group.id}`}>
            <div>
              <div className="flex items-center">
                <GroupAvatar
                  variant="sm"
                  groupType={group.type}
                  groupColor={group.color}
                />
                <h2 className="mx-2 line-clamp-1 flex-1 font-medium">
                  {group.name}
                </h2>
                <GroupBalance userId={user.id} data={group.simplifiedDebts} />
              </div>
              <div className="ml-16">
                <DebtsOverview userId={user.id} groupId={group.id} />
              </div>
            </div>
          </Link>
        ))}
      </section>
    </>
  );
}
