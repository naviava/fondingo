import Link from "next/link";

import { Button } from "@fondingo/ui/button";
import { SearchBar } from "~/components/search-bar";
import { GroupsPanel } from "~/components/groups-panel";
import { serverClient } from "~/lib/trpc/server-client";
import { redirect } from "next/navigation";

export default async function GroupsPage() {
  const user = await serverClient.user.getAuthProfile();
  const groups = await serverClient.group.getGroups();

  if (!user) {
    return redirect("/api/auth/signin");
  }

  return (
    <>
      <div className="flex items-center justify-between px-4 pt-4">
        <SearchBar />
        <Button
          asChild
          variant="ghost"
          className="text-cta hover:text-cta text-base font-semibold md:text-lg"
        >
          <Link href="/create-group">Create group</Link>
        </Button>
      </div>
      <div className="my-10 px-4 font-semibold">
        Overall you are owed <span className="text-cta">$12916.39</span>
      </div>
      <GroupsPanel user={user} groups={groups} />
    </>
  );
}
