import { TCurrencyCode } from "@fondingo/db-split";
import { create } from "zustand";

type ChangeCurrencyModalStore = {
  currency: TCurrencyCode;
  setCurrency: (currency: TCurrencyCode) => void;

  isOpen: boolean;
  onOpen: (currency: TCurrencyCode) => void;
  onClose: () => void;
};

export const useChangeCurrencyModal = create<ChangeCurrencyModalStore>(
  (set) => ({
    currency: "USD",
    setCurrency: (currency) => set((state) => ({ ...state, currency })),

    isOpen: false,
    onOpen: (currency) => set({ isOpen: true, currency }),
    onClose: () => set({ isOpen: false }),
  }),
);
