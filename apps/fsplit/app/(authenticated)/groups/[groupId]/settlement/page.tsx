import { redirect } from "next/navigation";
import { Metadata } from "next";

import { SettlementForm } from "~/components/settlement-form";
import { serverClient } from "~/lib/trpc/server-client";

interface IProps {
  params: {
    groupId: string;
  };
}

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
  const group = await serverClient.group.getGroupById(params.groupId);
  if (!group) return {};

  return {
    title: `Settle up | ${group.name}`,
    description: `Settle up balances for group: ${group.name}`,
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
    <SettlementForm
      groupId={params.groupId}
      members={members}
      currency={group.currency}
    />
  );
}
