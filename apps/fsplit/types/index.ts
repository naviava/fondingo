import { TGroupMember, TSimplifiedDebt } from "@fondingo/db-split";

export type TGroupType = "TRIP" | "HOME" | "COUPLE" | "OTHER";

export type DebtWithDetails = TSimplifiedDebt & {
  to: TGroupMember;
  from: TGroupMember;
};

export type GroupMemberClient = {
  id: string;
  name: string;
  image: string;
};
