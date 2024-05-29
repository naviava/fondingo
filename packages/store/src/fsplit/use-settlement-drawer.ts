import { create } from "zustand";

type GroupMemberClient = {
  id: string;
  name: string;
  image: string;
};

type DrawerOpenProps = {
  groupId: string;
  members: GroupMemberClient[];
  drawerType: "debtor" | "creditor";
};

type SettlementDrawer = {
  drawerType: "debtor" | "creditor";
  groupId: string;
  members: GroupMemberClient[];
  drawerTitle: string;
  breakPoint: number;

  isDrawerOpen: boolean;
  onDrawerOpen: ({ groupId, drawerType, members }: DrawerOpenProps) => void;
  onDrawerClose: () => void;

  selectedDebtor: GroupMemberClient | null;
  setSelectedDebtor: (member: GroupMemberClient) => void;

  selectedCreditor: GroupMemberClient | null;
  setSelectedCreditor: (member: GroupMemberClient) => void;

  resetDrawer: () => void;
};

const titleMap = {
  debtor: "Who is paying?",
  creditor: "Who is getting paid?",
};

export const useSettlementDrawer = create<SettlementDrawer>((set) => ({
  drawerType: "debtor",
  groupId: "",
  members: [],
  drawerTitle: "",
  breakPoint: 0,

  isDrawerOpen: false,
  onDrawerOpen: ({ groupId, members, drawerType }) =>
    set({
      drawerType,
      isDrawerOpen: true,
      groupId,
      members,
      drawerTitle: titleMap[drawerType],
      breakPoint: Date.now(),
    }),
  onDrawerClose: () =>
    set((state) => {
      if (Date.now() - state.breakPoint < 100) {
        return { ...state, isDrawerOpen: true };
      }
      return {
        drawerType: "debtor",
        isDrawerOpen: false,
        groupId: "",
        members: [],
        drawerTitle: "",
      };
    }),

  selectedDebtor: null,
  setSelectedDebtor: (member) => set({ selectedDebtor: member }),

  selectedCreditor: null,
  setSelectedCreditor: (member) => set({ selectedCreditor: member }),

  resetDrawer: () =>
    set({
      drawerType: "debtor",
      isDrawerOpen: false,
      groupId: "",
      members: [],
      drawerTitle: "",
      breakPoint: 0,
      selectedDebtor: null,
      selectedCreditor: null,
    }),
}));
