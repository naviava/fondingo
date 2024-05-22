import { create } from "zustand";
import { CurrencyCode } from "@fondingo/db-split";

type ExpenseDetails = {
  groupId: string;
  setGroupId: (groupId: string) => void;

  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;

  expenseName: string;
  setExpenseName: (expenseName: string) => void;

  expenseAmount: number;
  setExpenseAmount: (expenseAmount: number) => void;

  payments: {
    userId: string;
    userName: string;
    amount: number;
  }[];
  setPayments: (
    payments: {
      userId: string;
      userName: string;
      amount: number;
    }[],
  ) => void;
  clearPayments: () => void;

  splitType: "equally" | "custom";
  setSplitType: (splitType: "equally" | "custom") => void;

  splits: {
    userId: string;
    userName: string;
    amount: number;
  }[];
  setSplits: (
    splits: {
      userId: string;
      userName: string;
      amount: number;
    }[],
  ) => void;
  clearSplits: () => void;

  breakPoint: number;

  isPaymentsDrawerOpen: boolean;
  onPaymentsDrawerOpen: () => void;
  onPaymentsDrawerClose: () => void;

  isSplitsDrawerOpen: boolean;
  onSplitsDrawerOpen: () => void;
  onSplitsDrawerClose: () => void;

  clearExpenseDetails: () => void;
};

export const useExpenseDetails = create<ExpenseDetails>((set) => ({
  groupId: "",
  setGroupId: (groupId) => set({ groupId }),

  currency: "USD",
  setCurrency: (currency) => set({ currency }),

  expenseName: "",
  setExpenseName: (expenseName) => set({ expenseName }),

  expenseAmount: 0,
  setExpenseAmount: (expenseAmount) =>
    set({ expenseAmount: Number(expenseAmount) }),

  payments: [],
  setPayments: (payments) => set({ payments }),
  clearPayments: () => set({ payments: [] }),

  splitType: "equally" as const,
  setSplitType: (splitType) => set({ splitType }),

  splits: [],
  setSplits: (splits) => set({ splits }),
  clearSplits: () => set({ splits: [] }),

  breakPoint: 0,

  isPaymentsDrawerOpen: false,
  onPaymentsDrawerOpen: () =>
    set({ isPaymentsDrawerOpen: true, breakPoint: Date.now() }),
  onPaymentsDrawerClose: () => {
    set((state) => {
      if (Date.now() - state.breakPoint < 100) {
        return { ...state, isPaymentsDrawerOpen: true };
      }
      return { isPaymentsDrawerOpen: false };
    });
  },

  isSplitsDrawerOpen: false,
  onSplitsDrawerOpen: () =>
    set({ isSplitsDrawerOpen: true, breakPoint: Date.now() }),
  onSplitsDrawerClose: () => {
    set((state) => {
      if (Date.now() - state.breakPoint < 100) {
        return { isSplitsDrawerOpen: true };
      }
      return { isSplitsDrawerOpen: false };
    });
  },

  clearExpenseDetails: () =>
    set({
      groupId: "",
      currency: "USD",
      expenseName: "",
      expenseAmount: 0,
      payments: [],
      splits: [],
      splitType: "equally",
      isPaymentsDrawerOpen: false,
      isSplitsDrawerOpen: false,
    }),
}));
