import { create } from "zustand";

type ConfirmModalStore = {
  id: string;
  title: string;
  description: string;
  confirmAction: () => void;
  cancelAction: () => void;

  isOpen: boolean;
  onOpen: ({
    id,
    title,
    description,
    confirmAction,
    cancelAction,
  }: {
    id: string;
    title: string;
    description: string;
    confirmAction: () => void;
    cancelAction: () => void;
  }) => void;
  onClose: () => void;
};

export const useConfirmModal = create<ConfirmModalStore>((set) => ({
  id: "",
  title: "",
  description: "",
  confirmAction: () => {},
  cancelAction: () => {},

  isOpen: false,
  onOpen: ({ id, title, description, confirmAction, cancelAction }) =>
    set({
      isOpen: true,
      id,
      title,
      description,
      confirmAction,
      cancelAction,
    }),
  onClose: () =>
    set({
      isOpen: false,
      id: "",
      title: "",
      description: "",
      confirmAction: () => {},
      cancelAction: () => {},
    }),
}));
