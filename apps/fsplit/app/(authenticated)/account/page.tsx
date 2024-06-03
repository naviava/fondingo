import { serverClient } from "~/lib/trpc/server-client";
import { redirect } from "next/navigation";

import { DynamicScrollArea } from "@fondingo/ui/dynamic-scroll-area";
import { Preferences } from "~/components/account-page/preferences";
import { Feedback } from "~/components/account-page/feedback";
import { Logout } from "~/components/account-page/logout";
import { UserDetails } from "~/components/account-page/user-details";
import { SimpleTitleTopRef } from "~/components/simple-title-top-ref";

export default async function AccountPage() {
  const user = await serverClient.user.getAuthProfile();
  if (!user) return redirect("/signin");

  return (
    <div className="h-full">
      <SimpleTitleTopRef title="Account" />
      <DynamicScrollArea>
        <UserDetails
          email={user.email}
          userName={user.name || ""}
          imageUrl={user.image || ""}
        />
        <div className="mt-10 space-y-8">
          <Preferences />
          <Feedback />
        </div>
        <Logout />
      </DynamicScrollArea>
    </div>
  );
}
