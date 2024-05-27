import { serverClient } from "~/lib/trpc/server-client";
import { redirect } from "next/navigation";

import { Preferences } from "~/components/account-page/preferences";
import { Feedback } from "~/components/account-page/feedback";
import { Header } from "~/components/account-page/header";
import { Logout } from "~/components/account-page/logout";

export default async function AccountPage() {
  const user = await serverClient.user.getAuthProfile();
  if (!user) return redirect("api/auth/signin");

  return (
    <div className="h-full pb-24">
      <h1 className="pt-4 text-center text-xl font-semibold">Account</h1>
      <Header
        email={user.email}
        userName={user.name || ""}
        imageUrl={user.image || ""}
      />
      <div className="mt-10 space-y-8">
        <Preferences />
        <Feedback />
      </div>
      <Logout />
    </div>
  );
}
