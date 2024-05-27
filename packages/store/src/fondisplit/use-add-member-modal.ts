import { create } from "zustand";

type AddedMember = {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
};

type AddMemberStore = {
  // isGroupManager: boolean;
  userId: string;
  groupId: string;

  addedMembers: Record<string, AddedMember>;
  clearAddedMembers: () => void;
  toggleAddedMember: ({
    id,
    name,
    email,
    imageUrl,
  }: {
    id: string;
    email: string;
    name: string | null;
    imageUrl: string | null;
  }) => void;

  isOpen: boolean;
  onOpen: ({ userId, groupId }: { userId: string; groupId: string }) => void;
  onClose: () => void;
};

export const useAddMemberModal = create<AddMemberStore>((set) => ({
  // isGroupManager: false,
  userId: "",
  groupId: "",
  isPending: false,

  addedMembers: {},
  clearAddedMembers: () => set((state) => ({ ...state, addedMembers: {} })),
  toggleAddedMember: ({ id, name = "", email, imageUrl = "" }) =>
    set((state) => {
      if (!!state.addedMembers[id]) {
        const { [id]: _, ...rest } = state.addedMembers;
        return { ...state, addedMembers: rest };
      }
      return {
        ...state,
        addedMembers: {
          ...state.addedMembers,
          [id]: {
            id,
            name,
            email,
            imageUrl,
          },
        },
      };
    }),

  isOpen: false,
  onOpen: ({ userId, groupId }) => set({ isOpen: true, userId, groupId }),
  onClose: () =>
    set({ isOpen: false, userId: "", groupId: "", addedMembers: {} }),
}));
