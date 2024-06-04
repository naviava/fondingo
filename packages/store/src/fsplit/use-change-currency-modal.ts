import { CurrencyCode } from "@fondingo/db-split";
import { create } from "zustand";

type ChangeCurrencyModalStore = {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;

  isOpen: boolean;
  onOpen: (currency: CurrencyCode) => void;
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
