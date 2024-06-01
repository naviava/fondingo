import Link from "next/link";

import { CurrencyCode } from "@fondingo/db-split";
import { TGroupType } from "~/types";

import { GroupAvatar } from "../group-avatar";
import { Button } from "@fondingo/ui/button";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/utils";

interface IProps {
  groupId: string;
  groupName: string;
  groupColor: string;
  groupType: TGroupType;
  currency: CurrencyCode;
}

export function GroupNameEdit({
  groupId,
  groupName,
  groupColor,
  groupType,
  currency,
}: IProps) {
  return (
    <section className="mt-6 flex items-center justify-between px-4">
      <div className="flex items-center gap-x-2">
        <GroupAvatar groupType={groupType} groupColor={groupColor} />
        <h2 className={cn("line-clamp-1 font-semibold", hfont.className)}>
          {groupName}
        </h2>
      </div>
      {/* TODO: Activate this link */}
      <Button asChild size="sm" variant="ctaGhost" className={hfont.className}>
        <Link
          href={`/groups/${groupId}/edit?groupName=${groupName}&color=${groupColor.slice(1)}&type=${groupType}&currency=${currency}`}
        >
          Edit
        </Link>
      </Button>
    </section>
  );
}
