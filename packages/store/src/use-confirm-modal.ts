import { create } from "zustand";

type ConfirmModalStore = {
  title: string;
  description: string;
  confirmAction: () => void;
  cancelAction: () => void;

  isOpen: boolean;
  onOpen: ({
    title,
    description,
    confirmAction,
    cancelAction,
  }: {
    title: string;
    description: string;
    confirmAction: () => void;
    cancelAction: () => void;
  }) => void;
  onClose: () => void;
};

export const useConfirmModal = create<ConfirmModalStore>((set) => ({
  title: "",
  description: "",
  confirmAction: () => {},
  cancelAction: () => {},

  isOpen: false,
  onOpen: ({ title, description, confirmAction, cancelAction }) =>
    set({
      isOpen: true,
      title,
      description,
      confirmAction,
      cancelAction,
    }),
  onClose: () =>
    set({
      isOpen: false,
      title: "",
      description: "",
      confirmAction: () => {},
      cancelAction: () => {},
    }),
}));
