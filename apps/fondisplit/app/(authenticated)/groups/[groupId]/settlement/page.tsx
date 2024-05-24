import { SettlementClient } from "~/components/settlement-client";
import { serverClient } from "~/lib/trpc/server-client";
import { redirect } from "next/navigation";

interface IProps {
  params: {
    groupId: string;
  };
}

export default async function SettleUpPage({ params }: IProps) {
  const group = await serverClient.group.getGroupById(params.groupId);
  if (!group) return redirect("/groups");

  const members = group.members.map((member) => ({
    id: member.id,
    name: member.name,
    image: member.user?.image || "",
  }));

  return (
    <SettlementClient
      groupId={params.groupId}
      members={members}
      currency={group.currency}
    />
  );
}
