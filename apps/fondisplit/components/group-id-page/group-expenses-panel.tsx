"use client";

import { useAddMemberModal } from "@fondingo/store/fondisplit";
import { ScrollArea } from "@fondingo/ui/scroll-area";
import { UserPlus } from "@fondingo/ui/lucide";
import { Button } from "@fondingo/ui/button";

interface IProps {
  hasMembers: boolean;
  hasExpenses: boolean;
  groupId: string;
  isGroupManager: boolean;
}

export function GroupExpensesPanel({
  hasMembers,
  hasExpenses,
  groupId,
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

  return (
    <ScrollArea className="h-[55vh] flex-1 md:h-[58vh] lg:h-[68vh] xl:h-[67vh]"></ScrollArea>
  );
}
