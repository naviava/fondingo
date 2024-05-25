"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { AdvancedSettingEntry } from "./advanced-setting-entry";
import { serverClient } from "~/lib/trpc/server-client";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FcCalculator } from "react-icons/fc";
import { GiExitDoor } from "react-icons/gi";

interface IProps {
  group: Awaited<ReturnType<typeof serverClient.group.getGroupById>>;
  userId: string | undefined;
}

export function AdvancedSettings({ userId, group }: IProps) {
  const router = useRouter();
  const hasBalances = useMemo(
    () =>
      group.simplifiedDebts.filter(
        (debt) => debt.from.userId === userId || debt.to.userId === userId,
      ).length > 0,
    [group.simplifiedDebts, userId],
  );

  return (
    <section className="space-y-6">
      <h3 className="px-4 text-base font-semibold">Advanced</h3>
      <ul className="space-y-4">
        <AdvancedSettingEntry
          groupId={group.id}
          icon={FcCalculator}
          title="Calculate debts"
          description="Automatically combines debts to reduce the total number of repayments between group members."
          action={() => {}}
        />
        <AdvancedSettingEntry
          groupId={group.id}
          title="Change currency"
          currency={group.currency}
          description="Change the currency used in this group."
          action={() =>
            router.push(
              `/groups/${group.id}/edit?groupName=${group.name}&color=${group.color.slice(1)}&type=${group.type}&currency=${group.currency}`,
            )
          }
        />
        <AdvancedSettingEntry
          groupId={group.id}
          icon={GiExitDoor}
          title="Leave group"
          description={
            hasBalances
              ? "You can't leave this group because you have outstanding debts with other group members."
              : ""
          }
          disabled={hasBalances}
          action={() => {}}
        />
        <AdvancedSettingEntry
          groupId={group.id}
          icon={RiDeleteBin6Line}
          title="Delete group"
          action={() => {}}
          smallIcon
        />
      </ul>
    </section>
  );
}
