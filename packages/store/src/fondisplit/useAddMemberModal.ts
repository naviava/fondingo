import { create } from "zustand";

type AddMemberStore = {
  groupId: string;
  isGroupManager: boolean;
  isOpen: boolean;
  onOpen: (groupId: string, isGroupManager: boolean) => void;
  onClose: () => void;
};

export const useAddMemberModal = create<AddMemberStore>((set) => ({
  groupId: "",
  isGroupManager: false,
  isOpen: false,
  onOpen: (groupId: string, isGroupManager: boolean) =>
    set({ isOpen: true, groupId, isGroupManager }),
  onClose: () => set({ isOpen: false, groupId: "", isGroupManager: false }),
}));
