import { redirect } from "next/navigation";

import { serverClient } from "~/lib/trpc/server-client";
import { GroupMemberClient } from "~/types";

import { SettlementClient } from "~/components/settlement-client";

interface IProps {
  params: {
    groupId: string;
  };
}

export default async function SettleUpPage({ params }: IProps) {
  const group = await serverClient.group.getGroupById(params.groupId);
  if (!group) return redirect("/groups");

  const debtors = group.simplifiedDebts.reduce<GroupMemberClient[]>(
    (acc, debtor) => {
      const index = acc.findIndex((item) => item.id === debtor.from.id);
      if (index === -1) {
        acc.push({
          id: debtor.from.id,
          name: debtor.from.name,
          image: debtor.from.user?.image || "",
        });
      }
      return acc;
    },
    [],
  );

  const creditors = group.simplifiedDebts.reduce<GroupMemberClient[]>(
    (acc, creditor) => {
      const index = acc.findIndex((item) => item.id === creditor.to.id);
      if (index === -1) {
        acc.push({
          id: creditor.to.id,
          name: creditor.to.name,
          image: creditor.to.user?.image || "",
        });
      }
      return acc;
    },
    [],
  );

  return (
    <SettlementClient
      groupId={params.groupId}
      debtors={debtors}
      creditors={creditors}
    />
  );
}
