import Link from "next/link";
import { redirect } from "next/navigation";

import { OverallGrossBalance } from "~/components/overall-gross-balance";
import { DebtsOverview } from "~/components/groups-panel/debts-overview";
import { GroupBalance } from "~/components/groups-panel/group-balance";
import { EmptyState } from "~/components/groups-panel/empty-state";
import { SocialHeader } from "~/components/social-header";
import { GroupAvatar } from "~/components/group-avatar";
import { ScrollArea } from "@fondingo/ui/scroll-area";

import { serverClient } from "~/lib/trpc/server-client";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/lib/utils";

export default async function GroupsPage() {
  const user = await serverClient.user.getAuthProfile();
  const groups = await serverClient.group.getGroups();

  if (!user) {
    return redirect("/api/auth/signin");
  }
  if (!user) return redirect("/api/auth/signin");

  return (
    <>
      <SocialHeader />
      <OverallGrossBalance />
      {!groups.length ? (
        <EmptyState />
      ) : (
        <ScrollArea className="h-[80vh] md:h-[82vh] lg:h-[79vh]">
          <section className="flex flex-1 flex-col gap-y-6 pb-24">
            {groups.map((group) => (
              <Link
                key={group.id}
                href={`/groups/${group.id}`}
                className="px-4 py-1 hover:bg-neutral-200"
              >
                <div className="flex items-center">
                  <GroupAvatar
                    variant="sm"
                    groupType={group.type}
                    groupColor={group.color}
                    className="hover:text-neutral-200"
                  />
                  <h2
                    className={cn(
                      "mx-2 line-clamp-1 flex-1 text-sm font-semibold",
                      hfont.className,
                    )}
                  >
                    {group.name}
                  </h2>
                  <GroupBalance
                    userId={user.id}
                    data={group.simplifiedDebts}
                    currency={group.currency}
                  />
                </div>
                <div className="ml-16">
                  <DebtsOverview
                    userId={user.id}
                    groupId={group.id}
                    currency={group.currency}
                  />
                </div>
              </Link>
            ))}
          </section>
        </ScrollArea>
      )}
    </>
  );
}
