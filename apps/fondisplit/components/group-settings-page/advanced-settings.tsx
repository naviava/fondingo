import { AdvancedSettingEntry } from "./advanced-setting-entry";
import { serverClient } from "~/lib/trpc/server-client";

interface IProps {
  group: Awaited<ReturnType<typeof serverClient.group.getGroupById>>;
}

export function AdvancedSettings({ group }: IProps) {
  return (
    <section className="space-y-6 px-4">
      <h3 className="text-base font-semibold">Advanced</h3>
      <ul className="space-y-4">
        <AdvancedSettingEntry
          groupId={group.id}
          currency="USD"
          memberId="dasdas"
          memberName="Navin"
          memberEmail="yourname@gmail.com"
          imageUrl=""
        />
      </ul>
    </section>
  );
}
