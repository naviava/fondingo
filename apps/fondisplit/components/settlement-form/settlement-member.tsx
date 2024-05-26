import { useSettlementDrawer } from "@fondingo/store/fondisplit";
import { Avatar } from "@fondingo/ui/avatar";
import { GroupMemberClient } from "~/types";
import { memo } from "react";

interface IProps {
  groupId: string;
  drawerType: "debtor" | "creditor";
  selectedMember: GroupMemberClient | null;
  members: GroupMemberClient[];
  isPending: boolean;
}

export const SettlementMember = memo(_SettlementMember);
function _SettlementMember({
  groupId,
  drawerType,
  members,
  selectedMember,
  isPending = false,
}: IProps) {
  const { onDrawerOpen } = useSettlementDrawer();

  return (
    <div
      role="button"
      onClick={() => {
        if (isPending) return;
        onDrawerOpen({
          groupId,
          members,
          drawerType,
        });
      }}
      className="flex select-none flex-col items-center justify-center"
    >
      <Avatar
        key={selectedMember?.id}
        variant="lg"
        userName={selectedMember?.name || ""}
        userImageUrl={selectedMember?.image}
      />
      <h4 className="mt-4 line-clamp-1 w-[8rem] text-center font-medium">
        {selectedMember?.name}
      </h4>
    </div>
  );
}
