import { TCurrencyCode } from "@fondingo/db-split";
import { GroupForm } from "~/components/group-form";
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
