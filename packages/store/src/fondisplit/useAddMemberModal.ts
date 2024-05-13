import { create } from "zustand";

type AddMemberStore = {
  isOpen: boolean;
  onOpen: (url: string) => void;
  onClose: () => void;
};

export const useAddMemberModal = create<AddMemberStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
