import { create } from "zustand";

type ConfirmModalStore = {
  confirmId: string;
  isOpen: boolean;
  onOpen: ({
    id,
    confirmAction,
    cancelAction,
  }: {
    id: string;
    confirmAction: () => void;
    cancelAction: () => void;
  }) => void;
  onClose: () => void;
  confirmAction: () => void;
  cancelAction: () => void;
};

export const useConfirmModal = create<ConfirmModalStore>((set) => ({
  confirmId: "",
  isOpen: false,
  confirmAction: () => {},
  cancelAction: () => {},
  onOpen: ({ id, confirmAction, cancelAction }) =>
    set({
      isOpen: true,
      confirmId: id,
      confirmAction,
      cancelAction,
    }),
  onClose: () =>
    set({
      isOpen: false,
      confirmId: "",
      confirmAction: () => {},
      cancelAction: () => {},
    }),
}));
