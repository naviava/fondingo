import { serverClient } from "~/lib/trpc/server-client";
import { redirect } from "next/navigation";

import { OptionsArea } from "~/components/account-page/options-area";
import { Header } from "~/components/account-page/header";

export default async function AccountPage() {
  const user = await serverClient.user.getAuthProfile();
  if (!user) return redirect("/signin");

  return (
    <div className="h-full pb-24">
      <Header
        email={user.email}
        userName={user.name || ""}
        imageUrl={user.image || ""}
      />
      <OptionsArea />
    </div>
  );
}
