import { AdvancedSettings } from "~/components/group-settings-page/advanced-settings";
import { GroupNameEdit } from "~/components/group-settings-page/group-name-edit";
import { MembersPanel } from "~/components/group-settings-page/members-panel";
import { PageHeader } from "~/components/group-settings-page/page-header";
import { Separator } from "@fondingo/ui/separator";

import { serverClient } from "~/lib/trpc/server-client";

interface IProps {
  params: {
    groupId: string;
  };
}

export default async function GroupIdSettingspage({ params }: IProps) {
  const user = await serverClient.user.getAuthProfile();
  const group = await serverClient.group.getGroupById(params.groupId);

  return (
    <>
      <PageHeader />
      <GroupNameEdit
        groupName={group.name}
        groupType={group.type}
        groupColor={group.color}
      />
      <Separator className="mb-6 mt-2" />
      <MembersPanel group={group} />
      <Separator className="my-6" />
      <AdvancedSettings group={group} />
    </>
  );
}
