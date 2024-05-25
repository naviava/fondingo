import { create } from "zustand";

type AddMemberStore = {
  // isGroupManager: boolean;
  userId: string;
  groupId: string;
  isOpen: boolean;
  onOpen: ({ userId, groupId }: { userId: string; groupId: string }) => void;
  onClose: () => void;
};

export const useAddMemberModal = create<AddMemberStore>((set) => ({
  // isGroupManager: false,
  userId: "",
  groupId: "",
  isOpen: false,
  onOpen: ({ userId, groupId }) => set({ isOpen: true, userId, groupId }),
  onClose: () => set({ isOpen: false, userId: "", groupId: "" }),
}));
