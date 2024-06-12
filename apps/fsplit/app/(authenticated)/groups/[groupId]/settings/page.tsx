import { Metadata } from "next";

import { AdvancedSettings } from "~/components/group-settings-page/advanced-settings";
import { GroupNameEdit } from "~/components/group-settings-page/group-name-edit";
import { MembersPanel } from "~/components/group-settings-page/members-panel";
import { PageHeader } from "~/components/group-settings-page/page-header";
import { DynamicScrollArea } from "@fondingo/ui/dynamic-scroll-area";
import { Separator } from "@fondingo/ui/separator";

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
    title: `Settings | ${group.name}`,
    description: `Customize group details, members and advanced settings for group: ${group.name}`,
  };
}

export default async function GroupIdSettingspage({ params }: IProps) {
  const user = await serverClient.user.getAuthProfile();
  const group = await serverClient.group.getGroupById(params.groupId);

  return (
    <>
      <PageHeader groupId={group.id} />
      <DynamicScrollArea>
        <GroupNameEdit
          groupId={group.id}
          groupName={group.name}
          groupType={group.type}
          groupColor={group.color}
          currency={group.currency}
        />
        <Separator className="mb-6 mt-2" />
        <MembersPanel userId={user?.id} group={group} />
        <Separator className="my-6" />
        <AdvancedSettings userId={user?.id} group={group} />
      </DynamicScrollArea>
    </>
  );
}
