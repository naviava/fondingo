import { redirect } from "next/navigation";

import { SettleUpClient } from "~/components/settle-up-client";
import { serverClient } from "~/lib/trpc/server-client";

interface IProps {
  params: {
    groupId: string;
  };
}

export default async function SettleUpPage({ params }: IProps) {
  const group = await serverClient.group.getGroupById(params.groupId);
  if (!group) return redirect("/groups");

  return <SettleUpClient group={group} />;
}
