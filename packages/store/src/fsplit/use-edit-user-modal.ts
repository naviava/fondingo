import { create } from "zustand";

type EditUserModalStore = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useEditUserModal = create<EditUserModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
