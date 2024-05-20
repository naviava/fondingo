import { GroupMember, SimplifiedDebt } from "@fondingo/db-split";

export type TGroupType = "TRIP" | "HOME" | "COUPLE" | "OTHER";

export type DebtWithDetails = SimplifiedDebt & {
  to: GroupMember;
  from: GroupMember;
};

export type GroupMemberClient = {
  id: string;
  name: string;
  image: string;
};
