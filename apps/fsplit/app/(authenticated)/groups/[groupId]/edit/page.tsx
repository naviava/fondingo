import { TCurrencyCode } from "@fondingo/db-split";
import { Metadata } from "next";
import { GroupForm } from "~/components/forms/group-form";
import { serverClient } from "~/lib/trpc/server-client";
import { TGroupType } from "~/types";

interface IProps {
  params: { groupId: string };
  searchParams: {
    groupName: string;
    color: string;
    type: string;
    currency: string;
  };
}

export async function generateMetadata({ params }: IProps): Promise<Metadata> {
  const group = await serverClient.group.getGroupById(params.groupId);
  if (!group) return {};

  return {
    title: `Customize | ${group.name}`,
    description: `Customize name, currency, type and color for group: ${group.name}`,
  };
}

export default function EditGroupIdPage({ params, searchParams }: IProps) {
  return (
    <GroupForm
      isEditing
      initialData={{
        groupId: params.groupId,
        groupName: searchParams.groupName,
        color: `#${searchParams.color}`,
        type: searchParams.type as TGroupType,
        currency: searchParams.currency as TCurrencyCode,
      }}
    />
  );
}
