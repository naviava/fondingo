import { create } from "zustand";

type EditUserModalStore = {
  displayName: string;
  firstName: string;
  lastName: string;
  phone?: string;

  isOpen: boolean;
  onOpen: ({
    displayName,
    firstName,
    lastName,
    phone,
  }: {
    displayName: string;
    firstName?: string | undefined;
    lastName?: string | undefined;
    phone?: string | undefined;
  }) => void;
  onClose: () => void;
};

export const useEditUserModal = create<EditUserModalStore>((set) => ({
  displayName: "",
  firstName: "",
  lastName: "",
  phone: "",

  isOpen: false,
  onOpen: ({ displayName, firstName, lastName, phone }) =>
    set({
      isOpen: true,
      displayName,
      firstName,
      lastName,
      phone,
    }),
  onClose: () =>
    set({
      isOpen: false,
      displayName: "",
      firstName: "",
      lastName: "",
      phone: "",
    }),
}));
