import { Button } from "@fondingo/ui/button";
import { GroupAvatar } from "../group-avatar";
import { TGroupType } from "~/types";
import Link from "next/link";

interface IProps {
  groupId: string;
  groupName: string;
  groupColor: string;
  groupType: TGroupType;
}

export function GroupNameEdit({
  groupId,
  groupName,
  groupColor,
  groupType,
}: IProps) {
  return (
    <section className="mt-6 flex items-center justify-between px-4">
      <div className="flex items-center gap-x-2">
        <GroupAvatar groupType={groupType} groupColor={groupColor} />
        <h2 className="line-clamp-1 font-semibold">{groupName}</h2>
      </div>
      {/* TODO: Activate this link */}
      <Button asChild size="sm" variant="splitGhost">
        <Link href={`/groups/${groupId}/edit`}>Edit</Link>
      </Button>
    </section>
  );
}
