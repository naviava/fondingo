"use client";

import { useAddMemberModal } from "@fondingo/store/fondisplit";
import { PiUserCirclePlus } from "react-icons/pi";

interface IProps {
  groupId: string;
}

export function AddMemberOption({ groupId }: IProps) {
  const { onOpen } = useAddMemberModal();

  return (
    <div
      role="button"
      onClick={() => onOpen(groupId)}
      className="flex items-center gap-x-4 px-4 hover:bg-neutral-200"
    >
      <div className="flex h-14 w-14 items-center justify-center">
        <PiUserCirclePlus className="h-8 w-8" />
      </div>
      <span className="font-semibold">Add people to group</span>
    </div>
  );
}
