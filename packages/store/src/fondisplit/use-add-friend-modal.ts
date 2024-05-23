import { create } from "zustand";

type AddFriendModalStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useAddFriendModal = create<AddFriendModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
