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
      className="select-none"
    >
      <Avatar
        key={selectedMember?.id}
        variant="lg"
        userName={selectedMember?.name || ""}
        userImageUrl={selectedMember?.image}
      />
    </div>
  );
}
