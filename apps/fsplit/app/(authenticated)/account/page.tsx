import { serverClient } from "~/lib/trpc/server-client";
import { redirect } from "next/navigation";

import { SimpleTitleTopRef } from "~/components/simple-title-top-ref";
import { DynamicScrollArea } from "@fondingo/ui/dynamic-scroll-area";
import { UserDetails } from "~/components/account-page/user-details";
import { Preferences } from "~/components/account-page/preferences";
import { Feedback } from "~/components/account-page/feedback";
import { Logout } from "~/components/account-page/logout";
import { Metadata } from "next";
import { getServerSession } from "next-auth";

export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession();
  if (!session || !session.user || !session.user.email) return {};
  return {
    title: `${session.user.name}'s Account`,
    description: `Manage your account settings, preferences, and feedback.`,
  };
}

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
          <Preferences preferredCurrency={user.preferredCurrency} />
          <Feedback />
        </div>
        <Logout />
      </DynamicScrollArea>
    </div>
  );
}
