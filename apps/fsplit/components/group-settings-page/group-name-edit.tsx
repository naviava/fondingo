"use client";

import { useState } from "react";
import Link from "next/link";

import { CurrencyCode } from "@fondingo/db-split";
import { TGroupType } from "~/types";

import { GroupAvatar } from "../group-avatar";
import { Button } from "@fondingo/ui/button";
import { cn } from "@fondingo/ui/utils";
import { hfont } from "~/utils";
import { Loader } from "@fondingo/ui/lucide";

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
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <section className="mt-6 flex items-center justify-between px-4">
      <div className="flex items-center gap-x-2">
        <GroupAvatar groupType={groupType} groupColor={groupColor} />
        <h2 className={cn("line-clamp-1 font-semibold", hfont.className)}>
          {groupName}
        </h2>
      </div>
      <Button
        asChild
        size="sm"
        variant="ctaGhost"
        disabled={isNavigating}
        onClick={() => setIsNavigating(true)}
        className={hfont.className}
      >
        <Link
          href={`/groups/${groupId}/edit?groupName=${groupName}&color=${groupColor.slice(1)}&type=${groupType}&currency=${currency}`}
        >
          {isNavigating ? <Loader className="h-5 w-5 animate-spin" /> : "Edit"}
        </Link>
      </Button>
    </section>
  );
}
