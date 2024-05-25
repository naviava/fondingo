import { create } from "zustand";

type AddMemberStore = {
  // isGroupManager: boolean;
  groupId: string;
  isOpen: boolean;
  onOpen: (groupId: string) => void;
  onClose: () => void;
};

export const useAddMemberModal = create<AddMemberStore>((set) => ({
  // isGroupManager: false,
  groupId: "",
  isOpen: false,
  onOpen: (groupId: string) => set({ isOpen: true, groupId }),
  onClose: () => set({ isOpen: false, groupId: "" }),
}));
