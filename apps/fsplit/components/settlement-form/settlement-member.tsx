import { useSettlementDrawer } from "@fondingo/store/fondisplit";
import { Avatar } from "@fondingo/ui/avatar";
import { GroupMemberClient } from "~/types";
import { Dispatch, memo, SetStateAction } from "react";

interface IProps {
  flag: boolean;
  groupId: string;
  disabled: boolean;
  members: GroupMemberClient[];
  drawerType: "debtor" | "creditor";
  selectedMember: GroupMemberClient | null;
  setFlag: Dispatch<SetStateAction<boolean>>;
}

export const SettlementMember = memo(_SettlementMember);
function _SettlementMember({
  groupId,
  members,
  drawerType,
  flag = false,
  selectedMember,
  disabled = false,
  setFlag,
}: IProps) {
  const { onDrawerOpen } = useSettlementDrawer();

  return (
    <div
      role="button"
      onClick={() => {
        if (disabled) return;
        if (!flag) setFlag(true);
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
