import { title } from "process";
import { create } from "zustand";

type GroupMemberClient = {
  id: string;
  name: string;
  image: string;
};

type DrawerOpenProps = {
  groupId: string;
  members: GroupMemberClient[];
  title: "debtor" | "creditor";
};

type SettleUpDrawer = {
  groupId: string;
  members: GroupMemberClient[];
  drawerTitle: string;

  isDrawerOpen: boolean;
  onDrawerOpen: ({ groupId, title, members }: DrawerOpenProps) => void;
  onDrawerClose: () => void;

  selectedDebtor: GroupMemberClient | null;
  setSelectedDebtor: (member: GroupMemberClient) => void;

  selectedCreditor: GroupMemberClient | null;
  setSelectedCreditor: (member: GroupMemberClient) => void;

  resetDrawer: () => void;
};

const titleMap = {
  debtor: "Whos is paying?",
  creditor: "Who is getting paid?",
};

export const useSettleUpDrawer = create<SettleUpDrawer>((set) => ({
  groupId: "",
  members: [],
  drawerTitle: "",

  isDrawerOpen: false,
  onDrawerOpen: ({ groupId, members, title }) =>
    set({ isDrawerOpen: true, groupId, members, drawerTitle: titleMap[title] }),
  onDrawerClose: () =>
    set({ isDrawerOpen: false, groupId: "", members: [], drawerTitle: "" }),

  selectedDebtor: null,
  setSelectedDebtor: (member) => set({ selectedDebtor: member }),

  selectedCreditor: null,
  setSelectedCreditor: (member) => set({ selectedCreditor: member }),

  resetDrawer: () =>
    set({
      isDrawerOpen: false,
      groupId: "",
      members: [],
      drawerTitle: "",
      selectedDebtor: null,
      selectedCreditor: null,
    }),
}));
