"use client";

import { useAddMemberModal } from "@fondingo/store/fondisplit";
import { ScrollArea } from "@fondingo/ui/scroll-area";
import { UserPlus } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";

import { linearGradientWithAlpha } from "~/lib/utils";

interface IProps {
  groupId: string;
  groupColor: string;
  hasMembers: boolean;
  hasExpenses: boolean;
  isGroupManager: boolean;
}

export function GroupExpensesPanel({
  groupId,
  groupColor,
  hasMembers,
  hasExpenses,
  isGroupManager = false,
}: IProps) {
  const { onOpen } = useAddMemberModal();

  if (!hasMembers) {
    return (
      <div className="flex h-[55vh] flex-col items-center justify-center md:h-[58vh] lg:h-[68vh] xl:h-[67vh]">
        <h2 className="mb-10 text-center text-gray-500">
          You're the only one here!
        </h2>
        <Button
          type="button"
          variant="splitCta"
          onClick={() => onOpen(groupId, isGroupManager)}
          className="h-14 w-64 text-lg shadow-md shadow-neutral-500"
        >
          <UserPlus className="mr-2" size={24} />
          Add members
        </Button>
      </div>
    );
  }

  if (hasMembers && !hasExpenses) {
    return (
      <div className="flex h-[55vh] flex-col items-center justify-center px-4 text-center md:h-[58vh] lg:h-[68vh] xl:h-[67vh]">
        <h2 className="mb-2 text-center font-semibold tracking-wide">
          No expenses here yet.
        </h2>
        <p>Tap the plus button below to add an expense with this group.</p>
        <div
          className="mt-10 h-16 w-4"
          style={{
            backgroundImage: linearGradientWithAlpha(groupColor, 0.5),
          }}
        />
        <div
          style={{
            width: 0,
            height: 0,
            borderRight: "30px solid transparent",
            borderTop: `20px solid ${groupColor}`,
            borderLeft: "30px solid transparent",
          }}
        />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[55vh] flex-1 md:h-[58vh] lg:h-[68vh] xl:h-[67vh]"></ScrollArea>
  );
}
